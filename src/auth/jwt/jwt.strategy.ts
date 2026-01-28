import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // ⚠️ IMPORTANTE PARA DESPLIEGUE:
      // Cuando subas a Railway, usa process.env.JWT_SECRET
      secretOrKey: process.env.JWT_SECRET || 'jwt_secret_key', 
    });
  }

  async validate(payload: any) {
    // Esto es lo que se inyecta en req.user
    return {
      id: payload.sub, // 👈 CORREGIDO: Ahora se llama 'id', igual que en la base de datos
      email: payload.email,
      rol: payload.rol,
    };
  }
}