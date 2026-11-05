import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { ReportsService } from './reports.service';
@Controller('reports')
@Roles('ADMIN','SUPERVISOR')
export class ReportsController {
 constructor(private readonly reports:ReportsService){}
 @Get('overview') overview(){return this.reports.overview();}
}
