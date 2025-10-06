import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { pino } from 'pino';
import * as Sentry from '@sentry/node';
import { setupSwagger } from './swagger.config'; // ✅ Add this line

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

  // ✅ Initialize Swagger (only for non-production)
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
    logger.info('Swagger documentation available at /api/docs');
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.info(`Backend running on http://localhost:${port}`);
}
bootstrap();
