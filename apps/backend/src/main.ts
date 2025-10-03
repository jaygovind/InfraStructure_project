
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { pino } from 'pino'
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
    logger.info('Sentry initialized');
  }

  const app = await NestFactory.create(AppModule, { logger: false });
  app.enableCors({ origin: true, credentials: true });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.info(`Backend running on http://localhost:${port}`);
}
bootstrap();
