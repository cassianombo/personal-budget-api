import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: true, // Re-enabled after fixing schema issue
  logging: configService.get<string>('NODE_ENV') === 'development',
  ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
});
