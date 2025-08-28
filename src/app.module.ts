import { ConfigModule, ConfigService } from '@nestjs/config';

import { AccountsModule } from './accounts/accounts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { Module } from '@nestjs/common';
import { TransactionsModule } from './transactions/transactions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
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
    
    // Feature modules
    UsersModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
