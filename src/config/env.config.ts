import { ConfigModuleOptions } from '@nestjs/config';

export const getEnvConfig = (): ConfigModuleOptions => ({
  isGlobal: true,
  envFilePath: ['.env.local', '.env'],
  cache: true,

});
