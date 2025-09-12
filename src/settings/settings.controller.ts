import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { SettingsService } from './settings.service';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('account-options')
  getAccountSettings() {
    return this.settingsService.getAccountSettings();
  }

  @Get('user-options')
  getUserSettings() {
    return this.settingsService.getUserSettings();
  }
}
