import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
@Module({
 imports:[JwtModule.registerAsync({
  useFactory:()=>{
   const secret=process.env.JWT_SECRET;
   if(!secret||secret.length<32)throw new Error('JWT_SECRET must be at least 32 characters');
   return {secret,signOptions:{expiresIn:'8h'}};
  }
 })],
 controllers:[AuthController],
 providers:[AuthService,JwtAuthGuard],
 exports:[JwtModule,AuthService,JwtAuthGuard],
})
export class AuthModule{}
