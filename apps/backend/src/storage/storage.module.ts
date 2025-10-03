
import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { StorageController } from './storage.controller';

@Module({
  providers: [MinioService],
  controllers: [StorageController],
  exports: [MinioService],
})
export class StorageModule {}
