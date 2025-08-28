import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { getEnvConfig } from './config/env.config';

@Module({
  imports: [
    // Configuração global das variáveis de ambiente
    ConfigModule.forRoot(getEnvConfig()),
    
    // Configuração do banco de dados
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
