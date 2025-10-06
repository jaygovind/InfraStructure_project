import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.connected = true;
      this.logger.log('✅ Connected to PostgreSQL database successfully');
    } catch (error: unknown) {
      this.connected = false;
        if (error instanceof Error) {
      this.logger.error(`⚠️ Failed to connect to PostgreSQL: ${error.message}`);
        }
      this.logger.warn('Continuing app startup without an active database connection.');
    }
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.$disconnect();
      this.logger.log('🧹 Database connection closed successfully');
    } else {
      this.logger.warn('⚠️ Skipped disconnect — no active database connection.');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
