import { IsBoolean, IsIn, IsString } from 'class-validator';

import { SETTING_OPTIONS } from '../../config/default-settings';

export class UserSettingsDto {
  @IsString()
  @IsIn(SETTING_OPTIONS.language)
  language: string;

  @IsString()
  @IsIn(SETTING_OPTIONS.currency)
  currency: string;

  @IsBoolean()
  isBiometricLocked: boolean;
}
