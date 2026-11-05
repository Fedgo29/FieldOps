import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkOrdersModule } from './work-orders/work-orders.module';

@Module({
  imports: [WorkOrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
