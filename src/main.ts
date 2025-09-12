import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Converte automaticamente tipos
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Rejeita requisições com propriedades extras
      validateCustomDecorators: true, // Valida decorators customizados
      transformOptions: {
        enableImplicitConversion: true, // Converte tipos automaticamente
      },
      skipMissingProperties: false, // Não pula validação de propriedades ausentes
      skipNullProperties: false, // Não pula validação de propriedades null
      skipUndefinedProperties: false, // Não pula validação de propriedades undefined
    }),
  );

  const port = process.env.PORT ?? 7700;
  await app.listen(port);

  Logger.log(`🚀 API running on port ${port}`);
}
bootstrap();
