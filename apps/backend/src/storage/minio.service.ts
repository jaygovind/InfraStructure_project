
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client as MinioClient } from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: MinioClient;
  private logger = new Logger('MinioService');
  private bucket = process.env.MINIO_BUCKET || 'swiftride-media';

  constructor() {
    const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = Number(process.env.MINIO_PORT || 9000);
    const useSSL = (process.env.MINIO_USE_SSL || 'false') === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minio';
    const secretKey = process.env.MINIO_SECRET_KEY || 'minio123';

    this.client = new MinioClient({ endPoint, port, useSSL, accessKey, secretKey });
  }

  async onModuleInit() {
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
      this.logger.log(`Bucket created: ${this.bucket}`);
    } else {
      this.logger.log(`Bucket exists: ${this.bucket}`);
    }
  }

  getClient() {
    return this.client;
  }

  getBucket() {
    return this.bucket;
  }
}
