import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import type { Principal } from '../auth/role';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrdersService } from './work-orders.service';
@Controller('work-orders')
export class WorkOrdersController {
 constructor(private readonly workOrdersService:WorkOrdersService){}
 @Get() findAll(@CurrentUser() user:Principal){return this.workOrdersService.findAll(user);}
 @Get(':id/events') events(@Param('id',ParseUUIDPipe) id:string,@CurrentUser() user:Principal){
  return this.workOrdersService.events(id,user);
 }
 @Get(':id') findOne(@Param('id',ParseUUIDPipe) id:string,@CurrentUser() user:Principal){
  return this.workOrdersService.findOne(id,user);
 }
 @Post() @Roles('ADMIN','SUPERVISOR') create(@Body() dto:CreateWorkOrderDto,@CurrentUser() user:Principal){
  return this.workOrdersService.create(dto,user);
 }
 @Patch(':id') update(@Param('id',ParseUUIDPipe) id:string,@Body() dto:UpdateWorkOrderDto,@CurrentUser() user:Principal){
  return this.workOrdersService.update(id,dto,user);
 }
}
