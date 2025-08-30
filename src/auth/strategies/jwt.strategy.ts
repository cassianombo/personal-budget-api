import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthJwtPayload } from "../types/auth-jwtPayload";
import type { ConfigType } from "@nestjs/config";
import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import jwtConfig from "../config/jwt.config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(jwtConfig.KEY)
        private jwtConfiguration: ConfigType<typeof jwtConfig>
        ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConfiguration.secret as string,
        });
    }

    validate(payload: AuthJwtPayload) {
        return { id: payload.sub }; 
    }
}