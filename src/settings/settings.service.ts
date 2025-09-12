import { ACCOUNT_SETTINGS } from './constants/account.constants';
import { Injectable } from '@nestjs/common';
import { USER_SETTINGS } from './constants/usersettings.constants';

@Injectable()
export class SettingsService {
  constructor() {}

  async getAccountSettings() {
    return ACCOUNT_SETTINGS;
  }

  async getUserSettings() {
    return USER_SETTINGS;
  }
}
