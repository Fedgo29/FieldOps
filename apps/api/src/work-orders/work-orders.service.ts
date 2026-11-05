import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import type { Principal } from '../auth/role';
import type { CreateWorkOrderDto, Status } from './dto/create-work-order.dto';
import type { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import type { PoolClient } from 'pg';
export interface WorkOrder {
 id:string; title:string; description:string|null; priority:string; status:Status;
 technician_id:string|null; created_by:string; created_at:Date; updated_at:Date; completed_at:Date|null;
}
const FIELDS='id,title,description,priority,status,technician_id,created_by,created_at,updated_at,completed_at';
const ALLOWED:Record<Status,Status[]>={
 PENDING:['IN_PROGRESS','CANCELLED'],
 IN_PROGRESS:['COMPLETED','CANCELLED'],
 COMPLETED:[],
 CANCELLED:[]
};
@Injectable()
export class WorkOrdersService {
 constructor(private readonly db:DbService){}
 async findAll(actor:Principal):Promise<WorkOrder[]>{
  const technician=actor.role==='TECHNICIAN';
  const sql='SELECT '+FIELDS+' FROM work_orders '+(technician?'WHERE technician_id=$1 ':'')+'ORDER BY created_at DESC LIMIT 200';
  return (await this.db.query<WorkOrder>(sql,technician?[actor.sub]:[])).rows;
 }
 async findOne(id:string,actor:Principal):Promise<WorkOrder>{
  const technician=actor.role==='TECHNICIAN';
  const sql='SELECT '+FIELDS+' FROM work_orders WHERE id=$1 '+(technician?'AND technician_id=$2':'');
  const result=await this.db.query<WorkOrder>(sql,technician?[id,actor.sub]:[id]);
  if(!result.rows[0])throw new NotFoundException('Work order not found');
  return result.rows[0];
 }
 async create(input:CreateWorkOrderDto,actor:Principal):Promise<WorkOrder>{
  await this.validateTechnician(input.technicianId);
  const sql='INSERT INTO work_orders(title,description,priority,technician_id,created_by) VALUES($1,$2,$3,$4,$5) RETURNING '+FIELDS;
  return (await this.db.query<WorkOrder>(sql,[
   input.title,input.description??null,input.priority??'MEDIUM',input.technicianId??null,actor.sub
  ])).rows[0];
 }
 async update(id:string,input:UpdateWorkOrderDto,actor:Principal):Promise<WorkOrder>{
  return this.db.transaction(async(client)=>{
   const old=await client.query<WorkOrder>('SELECT '+FIELDS+' FROM work_orders WHERE id=$1 FOR UPDATE',[id]);
   const order=old.rows[0];
   if(!order||(actor.role==='TECHNICIAN'&&order.technician_id!==actor.sub))
    throw new NotFoundException('Work order not found');
   if(actor.role==='TECHNICIAN'&&Object.keys(input).some(k=>k!=='status'))
    throw new ForbiddenException('Technicians can only change status');
   if(input.status&&input.status!==order.status&&!ALLOWED[order.status].includes(input.status))
    throw new BadRequestException('Invalid status transition');
   if(['COMPLETED','CANCELLED'].includes(order.status))
    throw new BadRequestException('Closed orders cannot be changed');
   if(input.technicianId!==undefined)await this.validateTechnician(input.technicianId,client);
   const status=input.status??order.status;
   const sql='UPDATE work_orders SET title=$2,description=$3,priority=$4,status=$5,technician_id=$6,updated_at=NOW(),'+
    "completed_at=CASE WHEN $5='COMPLETED' THEN NOW() ELSE completed_at END WHERE id=$1 RETURNING "+FIELDS;
   const result=await client.query<WorkOrder>(sql,[
    id,input.title??order.title,input.description??order.description,input.priority??order.priority,
    status,input.technicianId??order.technician_id
   ]);
   if(status!==order.status){
    await client.query(
     'INSERT INTO work_order_events(work_order_id,actor_id,previous_status,new_status) VALUES($1,$2,$3,$4)',
     [id,actor.sub,order.status,status]
    );
   }
   return result.rows[0];
  });
 }
 async events(id:string,actor:Principal){
  await this.findOne(id,actor);
  return (await this.db.query(
   'SELECT id,actor_id,previous_status,new_status,created_at FROM work_order_events WHERE work_order_id=$1 ORDER BY created_at DESC',[id]
  )).rows;
 }
 private async validateTechnician(id?:string,client?:PoolClient):Promise<void>{
  if(!id)return;
  const sql='SELECT 1 FROM users WHERE id=$1 AND role=$2 AND is_active=true';
  const result=client?await client.query(sql,[id,'TECHNICIAN']):await this.db.query(sql,[id,'TECHNICIAN']);
  if(!result.rows.length)throw new BadRequestException('Invalid or inactive technician');
 }
}
