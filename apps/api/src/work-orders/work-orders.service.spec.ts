
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersService } from './work-orders.service';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [WorkOrdersService],
      }).compile();

    service = module.get<WorkOrdersService>(
      WorkOrdersService,
    );
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe devolver las órdenes existentes', () => {
    const orders = service.findAll();

    expect(orders).toHaveLength(2);
    expect(orders[0].id).toBe(1);
  });

  it('debe crear una orden correctamente', () => {
    const dto = {
      title: 'Reparación de servidor',
      description: 'Servidor fuera de servicio',
    };

    const result = service.create(dto);

    expect(result.id).toBe(3);
    expect(result.title).toBe(dto.title);
    expect(result.status).toBe('PENDING');
    expect(service.findAll()).toContainEqual(result);
  });

  it('debe generar IDs consecutivos', () => {
    const first = service.create({
      title: 'Primera orden',
    });

    const second = service.create({
      title: 'Segunda orden',
    });

    expect(first.id).toBe(3);
    expect(second.id).toBe(4);
  });
});
