
import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';

@Controller('storage')
export class StorageController {
  constructor(private minio: MinioService) {}

  @Get('health')
  async health() {
    return { ok: true, bucket: this.minio.getBucket() };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) return { ok: false, error: 'No file provided (field "file")' };
    const key = `${Date.now()}_${file.originalname}`;
   await this.minio.getClient().putObject(
        this.minio.getBucket(),
        key,
        file.buffer,
        file.buffer.length, // size in bytes
        { 'Content-Type': file.mimetype }
      );
    const publicUrl = process.env.MINIO_PUBLIC_URL
      ? `${process.env.MINIO_PUBLIC_URL}/${this.minio.getBucket()}/${key}`
      : key;
    return { ok: true, key, url: publicUrl };
  }
}
