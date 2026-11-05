import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DbService } from '../db/db.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { Principal } from './role';
@Injectable()
export class JwtAuthGuard implements CanActivate {
 constructor(private readonly jwt:JwtService,private readonly reflector:Reflector,private readonly db:DbService){}
 async canActivate(context:ExecutionContext):Promise<boolean>{
  const publicRoute=this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[
   context.getHandler(),context.getClass()
  ]);
  if(publicRoute)return true;
  const req=context.switchToHttp().getRequest<{headers:{authorization?:string};user?:Principal}>();
  const [type,token]=(req.headers.authorization??'').split(' ');
  if(type!=='Bearer'||!token)throw new UnauthorizedException('Token required');
  let payload:Principal;
  try {
   payload=await this.jwt.verifyAsync<Principal>(token);
   if(!payload.sub||!payload.role||!payload.email)throw new Error('Missing claims');
  }catch{throw new UnauthorizedException('Invalid or expired token');}
  const result=await this.db.query<{id:string;email:string;role:Principal['role']}>(
   'SELECT id,email,role FROM users WHERE id=$1 AND is_active=true',[payload.sub]
  );
  const active=result.rows[0];
  if(!active)throw new UnauthorizedException('Inactive or deleted user');
  req.user={sub:active.id,email:active.email,role:active.role};
  return true;
 }
}
