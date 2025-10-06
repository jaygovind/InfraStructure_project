import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('SwiftRide Backend API')
    .setDescription('API documentation for SwiftRide services')
    .setVersion('1.0')
    .addBearerAuth() // Adds “Authorize” button for JWTs
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'SwiftRide API Docs',
  });
}
