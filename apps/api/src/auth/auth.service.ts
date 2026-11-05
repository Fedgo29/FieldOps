import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { DbService } from '../db/db.service';
import type { Principal } from './role';

interface AuthRow {
  id: string;
  email: string;
  role: Principal['role'];
  password_hash: string;
  is_active: boolean;
}

@Injectable()
export class AuthService {
  constructor(private readonly db: DbService, private readonly jwt: JwtService) {}

  async login(email: string, password: string) {
    const result = await this.db.query<AuthRow>(
      'SELECT id, email, role, password_hash, is_active FROM users WHERE email = $1',
      [email.trim().toLowerCase()],
    );
    const user = result.rows[0];
    if (!user || !user.is_active || !(await compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: Principal = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: await this.jwt.signAsync(payload), user: payload };
  }
}
