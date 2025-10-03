
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from '../prisma.service';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
