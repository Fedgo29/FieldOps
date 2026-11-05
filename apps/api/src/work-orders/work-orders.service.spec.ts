import { WorkOrdersService } from './work-orders.service';
import { DbService } from '../db/db.service';
import type { Principal } from '../auth/role';
const supervisor:Principal={sub:'u1',email:'lead@fieldops.local',role:'SUPERVISOR'};
const tech:Principal={sub:'t1',email:'tech@fieldops.local',role:'TECHNICIAN'};
describe('WorkOrdersService',()=>{
 const query=jest.fn(),transaction=jest.fn();
 let service:WorkOrdersService;
 beforeEach(()=>{jest.clearAllMocks();service=new WorkOrdersService({query,transaction} as unknown as DbService);});
 it('lists all orders for supervisor',async()=>{
  query.mockResolvedValue({rows:[{id:'o1'}]});
  expect(await service.findAll(supervisor)).toEqual([{id:'o1'}]);
  expect(query.mock.calls[0][0]).not.toContain('WHERE technician_id');
 });
 it('filters technician orders by identity',async()=>{
  query.mockResolvedValue({rows:[]});
  await service.findAll(tech);
  expect(query.mock.calls[0][1]).toEqual(['t1']);
 });
 it('creates a pending work order',async()=>{
  query.mockResolvedValue({rows:[{id:'o2',status:'PENDING'}]});
  expect((await service.create({title:'Replace network cable'},supervisor)).status).toBe('PENDING');
  expect(query.mock.calls[0][1]).toEqual(['Replace network cable',null,'MEDIUM',null,'u1']);
 });
 it('rejects invalid transitions',async()=>{
  transaction.mockImplementation(async(callback:(client:unknown)=>Promise<unknown>)=>callback({
   query:jest.fn().mockResolvedValue({rows:[{id:'o1',status:'COMPLETED',technician_id:'t1'}]})
  }));
  await expect(service.update('o1',{status:'PENDING'},supervisor)).rejects.toThrow('Invalid status transition');
 });
});
