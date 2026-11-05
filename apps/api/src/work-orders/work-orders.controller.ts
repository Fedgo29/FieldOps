
import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';

import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(
    private readonly workOrdersService: WorkOrdersService,
  ) {}

  @Get()
  findAll() {
    return this.workOrdersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(dto);
  }
}
