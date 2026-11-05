
import { Injectable } from '@nestjs/common';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';

interface WorkOrder {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS';
}

@Injectable()
export class WorkOrdersService {
  private readonly workOrders: WorkOrder[] = [
    {
      id: 1,
      title: 'Reparación de computadora',
      status: 'PENDING',
    },
    {
      id: 2,
      title: 'Instalación de red',
      status: 'IN_PROGRESS',
    },
  ];

  private nextId = 3;

  findAll(): WorkOrder[] {
    return this.workOrders;
  }

  create(dto: CreateWorkOrderDto): WorkOrder {
    const workOrder: WorkOrder = {
      id: this.nextId++,
      title: dto.title,
      description: dto.description,
      status: 'PENDING',
    };

    this.workOrders.push(workOrder);

    return workOrder;
  }
}
