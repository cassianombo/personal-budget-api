import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsString()
  @IsOptional()
  @IsIn(['en', 'pt', 'es'])
  language?: string;

  @IsString()
  @IsOptional()
  @IsIn(['USD', 'EUR', 'GBP', 'BRL'])
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isBiometricLocked?: boolean;
}
