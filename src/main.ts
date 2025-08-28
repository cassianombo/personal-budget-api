import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  
  const port = process.env.PORT ?? 7700;
  await app.listen(port);
  
  Logger.log(`🚀 API running on port ${port}`);
}
bootstrap();
