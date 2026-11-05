import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { Principal, Role } from '../auth/role';
import { UsersService } from './users.service';
class CreateUserDto {
 @IsString() @MinLength(2) @MaxLength(100) fullName!:string;
 @IsEmail() email!:string;
 @IsString() @MinLength(12) @MaxLength(128) password!:string;
 @IsIn(['ADMIN','SUPERVISOR','TECHNICIAN']) role!:Role;
}
class StatusDto { @IsBoolean() active!:boolean; }
@Controller('users')
@Roles('ADMIN')
export class UsersController {
 constructor(private readonly users:UsersService){}
 @Get() findAll(){return this.users.findAll();}
 @Post() create(@Body() body:CreateUserDto){return this.users.create(body);}
 @Patch(':id/status')
 setActive(@Param('id',ParseUUIDPipe) id:string,@Body() body:StatusDto,@CurrentUser() actor:Principal){
  if(id===actor.sub && !body.active)throw new BadRequestException('Cannot deactivate your own account');
  return this.users.setActive(id,body.active);
 }
}
