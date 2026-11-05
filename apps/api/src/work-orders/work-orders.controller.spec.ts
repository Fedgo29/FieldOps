
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';

describe('WorkOrdersController', () => {
  let controller: WorkOrdersController;

  const serviceMock = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [WorkOrdersController],
        providers: [
          {
            provide: WorkOrdersService,
            useValue: serviceMock,
          },
        ],
      }).compile();

    controller = module.get<WorkOrdersController>(
      WorkOrdersController,
    );
  });

  it('debe consultar las órdenes mediante el servicio', () => {
    const orders = [
      {
        id: 1,
        title: 'Orden de prueba',
        status: 'PENDING',
      },
    ];

    serviceMock.findAll.mockReturnValue(orders);

    expect(controller.findAll()).toEqual(orders);
    expect(serviceMock.findAll).toHaveBeenCalledTimes(1);
  });

  it('debe delegar la creación al servicio', () => {
    const dto = {
      title: 'Instalación de equipos',
    };

    const created = {
      id: 3,
      title: dto.title,
      status: 'PENDING',
    };

    serviceMock.create.mockReturnValue(created);

    expect(controller.create(dto)).toEqual(created);
    expect(serviceMock.create).toHaveBeenCalledWith(dto);
  });
});
