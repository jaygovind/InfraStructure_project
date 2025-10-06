import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client as MinioClient } from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: MinioClient | null = null;
  private logger = new Logger('MinioService');
  private bucket = process.env.MINIO_BUCKET || 'swiftride-media';

  constructor() {
    try {
      const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
      const port = Number(process.env.MINIO_PORT || 9000);
      const useSSL = (process.env.MINIO_USE_SSL || 'false') === 'true';
      const accessKey = process.env.MINIO_ACCESS_KEY || 'minio';
      const secretKey = process.env.MINIO_SECRET_KEY || 'minio123';

      this.client = new MinioClient({ endPoint, port, useSSL, accessKey, secretKey });
      this.logger.log(`MinIO client initialized (endpoint: ${endPoint}:${port})`);
    } catch (err: unknown) {
        if (err instanceof Error) {
      this.logger.error(`❌ Failed to initialize MinIO client: ${err.message}`);
        }
      this.client = null;
    }
  }

  async onModuleInit() {
    if (!this.client) {
      this.logger.warn('⚠️ MinIO client not available. Skipping bucket initialization.');
      return;
    }

    try {
      const exists = await this.client.bucketExists(this.bucket).catch(() => false);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
        this.logger.log(`✅ Bucket created: ${this.bucket}`);
      } else {
        this.logger.log(`✅ Bucket exists: ${this.bucket}`);
      }
    } catch (error: unknown) {
    if (error instanceof Error) {
      this.logger.warn(
        `⚠️ Unable to connect to MinIO server (${error.message}). Continuing without MinIO.`
      );
    }
      this.client = null; // disable MinIO client to avoid crashes later
   
   
    }
  }

  getClient() {
    if (!this.client) {
      this.logger.warn('⚠️ MinIO client unavailable — file operations will be skipped.');
      return null;
    }
    return this.client;
  }

  getBucket() {
    return this.bucket;
  }
}
