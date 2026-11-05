import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import type { Principal } from '../auth/role';
const actor:Principal={sub:'u1',email:'lead@fieldops.local',role:'SUPERVISOR'};
describe('WorkOrdersController',()=>{
 const service={findAll:jest.fn(),findOne:jest.fn(),events:jest.fn(),create:jest.fn(),update:jest.fn()};
 const controller=new WorkOrdersController(service as unknown as WorkOrdersService);
 beforeEach(()=>jest.clearAllMocks());
 it('delegates list with actor',()=>{controller.findAll(actor);expect(service.findAll).toHaveBeenCalledWith(actor);});
 it('delegates creation with actor',()=>{
  const dto={title:'Inspect workstation'};
  controller.create(dto,actor);
  expect(service.create).toHaveBeenCalledWith(dto,actor);
 });
 it('delegates updating',()=>{
  controller.update('11111111-1111-4111-8111-111111111111',{status:'IN_PROGRESS'},actor);
  expect(service.update).toHaveBeenCalledTimes(1);
 });
});
