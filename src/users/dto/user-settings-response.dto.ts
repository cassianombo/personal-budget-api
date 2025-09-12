import { UserSettingsDto } from './user-settings.dto';

export class UserSettingsResponseDto {
  userId: number;
  settings: UserSettingsDto;
}
