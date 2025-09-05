import {
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { Public } from './decorators/public.decorator';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Role } from 'src/enums/role.enum';
import { Roles } from './decorators/role.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user.id);
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    return await this.authService.refreshToken(req.user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Request() req, @Res() res) {
    try {
      console.log('Google callback', req.user);
      const response = await this.authService.login(req.user.id);
      const redirectUrl = `personal-finances-app://auth?access_token=${response.accessToken}&refresh_token=${response.refreshToken}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error in Google callback:', error);
      const errorUrl = `personal-finances-app://auth?error=authentication_failed`;
      return res.redirect(errorUrl);
    }
  }
}
