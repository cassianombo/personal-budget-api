import * as bcrypt from 'bcrypt';

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthJwtPayload } from './types/auth-jwtPayload';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import refreshJwtConfig from './config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY) private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>
  ) {}

  async validateUser(email: string, password: string){
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && await bcrypt.compare(password, user.password)) {
        return { id: user.id };
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  login(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const token = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, { 
      secret: this.refreshJwtConfiguration.secret,
      expiresIn: this.refreshJwtConfiguration.expiresIn 
    });

    return { 
      id: userId, 
      token, 
      refreshToken 
    };
  }

  refreshToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const token = this.jwtService.sign(payload);
    return { 
      id: userId,
      token,
    };
  }
}
