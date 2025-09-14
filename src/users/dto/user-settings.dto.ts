import {
  CurrencyOption,
  LanguageOption,
  SETTING_OPTIONS,
} from '../../config/default-settings.js';
import { IsBoolean, IsIn, IsString } from 'class-validator';

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

export class UserSettingsResponseDto {
  language: LanguageOption;
  currency: CurrencyOption;
  isBiometricLocked: boolean;
}
