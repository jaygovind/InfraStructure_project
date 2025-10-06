import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiProperty,
} from '@nestjs/swagger';

// ✅ DTOs for Swagger response
class HealthResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  @ApiProperty({ example: 'swiftride-media' })
  bucket: string;

  @ApiProperty({ example: true, required: false })
  exists?: boolean;

  @ApiProperty({ example: 'MinIO not reachable', required: false })
  message?: string;
}

class UploadResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  @ApiProperty({ example: '1696589654234_logo.png' })
  key: string;

  @ApiProperty({ example: 'http://localhost:9000/swiftride-media/1696589654234_logo.png' })
  url: string;

  @ApiProperty({ example: 'File upload skipped (MinIO offline)', required: false })
  message?: string;

  @ApiProperty({ example: 'Upload failed (MinIO unreachable)', required: false })
  error?: string;
}

@ApiTags('Storage') // Groups under "Storage" section in Swagger UI
@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(private minio: MinioService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check MinIO connection and bucket health' })
  @ApiOkResponse({
    description: 'MinIO health status and bucket existence',
    type: HealthResponseDto,
  })
  async health(): Promise<HealthResponseDto> {
    const client = this.minio.getClient();
    const bucket = this.minio.getBucket();

    if (!client) {
      this.logger.warn('MinIO not available — health check returning degraded status.');
      return { ok: false, message: 'MinIO not reachable', bucket };
    }

    try {
      const exists = await client.bucketExists(bucket);
      return { ok: true, bucket, exists };
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.warn(`MinIO health check failed: ${err.message}`);
      }
      return { ok: false, message: 'Cannot connect to MinIO', bucket };
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file to MinIO bucket' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File upload successful or mock upload when MinIO offline',
    type: UploadResponseDto,
  })
  async upload(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    if (!file) return { ok: false, error: 'No file provided (field "file")', key: '', url: '' };

    const client = this.minio.getClient();
    const bucket = this.minio.getBucket();
    const key = `${Date.now()}_${file.originalname}`;

    // 🧩 Handle when MinIO is unavailable
    if (!client) {
      this.logger.warn('MinIO unavailable — mock upload response returned.');
      return {
        ok: true,
        key,
        url: `mock://local/${bucket}/${key}`,
        message: 'File upload skipped (MinIO offline)',
      };
    }

    try {
      await client.putObject(bucket, key, file.buffer, file.buffer.length, {
        'Content-Type': file.mimetype,
      });

      const publicUrl = process.env.MINIO_PUBLIC_URL
        ? `${process.env.MINIO_PUBLIC_URL}/${bucket}/${key}`
        : key;

      return { ok: true, key, url: publicUrl };
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(`File upload failed: ${err.message}`);
      }
      return { ok: false, error: 'Upload failed (MinIO unreachable)', key, url: '' };
    }
  }
}
