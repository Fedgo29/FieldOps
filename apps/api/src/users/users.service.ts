import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { DbService } from '../db/db.service';
import type { Role } from '../auth/role';
export interface UserRow {
 id: string; full_name: string; email: string; role: Role; is_active: boolean; created_at: Date;
}
@Injectable()
export class UsersService {
 constructor(private readonly db: DbService) {}
 async findAll(): Promise<UserRow[]> {
  return (await this.db.query<UserRow>('SELECT id,full_name,email,role,is_active,created_at FROM users ORDER BY created_at DESC')).rows;
 }
 async create(input: { fullName:string; email:string; password:string; role:Role }): Promise<UserRow> {
  const passwordHash = await hash(input.password, 12);
  try {
   const result=await this.db.query<UserRow>(
    'INSERT INTO users (full_name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,full_name,email,role,is_active,created_at',
    [input.fullName,input.email.trim().toLowerCase(),passwordHash,input.role]
   );
   return result.rows[0];
  } catch(error:unknown) {
   if (typeof error==='object' && error!==null && 'code' in error && error.code==='23505') throw new ConflictException('Email already exists');
   throw error;
  }
 }
 async setActive(id:string,active:boolean): Promise<UserRow> {
  const result=await this.db.query<UserRow>(
   'UPDATE users SET is_active=$2,updated_at=NOW() WHERE id=$1 RETURNING id,full_name,email,role,is_active,created_at',[id,active]);
  if(!result.rows[0]) throw new NotFoundException('User not found');
  return result.rows[0];
 }
}
