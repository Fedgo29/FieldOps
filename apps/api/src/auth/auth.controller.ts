import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';
import type { Principal } from './role';
class LoginDto{
 @IsEmail() email!:string;
 @IsString() @MinLength(1) password!:string;
}
@Controller('auth')
export class AuthController {
 constructor(private readonly auth:AuthService){}
 @Public() @Post('login') login(@Body() body:LoginDto){return this.auth.login(body.email,body.password);}
 @Get('me') me(@CurrentUser() user:Principal){return user;}
}
