import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DbService } from '../db/db.service';
interface ReportRow { id:string; status:string; priority:string; created_at:Date; completed_at:Date|null; }
@Injectable()
export class ReportsService {
 constructor(private readonly db:DbService){}
 async overview(){
  const result=await this.db.query<ReportRow>(
   'SELECT id,status,priority,created_at,completed_at FROM work_orders ORDER BY created_at DESC LIMIT 5000');
  const url=process.env.REPORTING_URL,token=process.env.REPORTING_SERVICE_TOKEN;
  if(!url||!token) throw new ServiceUnavailableException('Reporting service not configured');
  let response:Response;
  try {
   response=await fetch(new URL('/api/reports/overview',url),{
    method:'POST',headers:{'content-type':'application/json','x-service-token':token},
    body:JSON.stringify({orders:result.rows.map(x=>({
     id:x.id,status:x.status,priority:x.priority,createdAt:x.created_at,completedAt:x.completed_at
    }))}),
    signal:AbortSignal.timeout(8000)
   });
  }catch{throw new BadGatewayException('Reporting service unavailable');}
  if(!response.ok)throw new BadGatewayException('Reporting service failed');
  return response.json();
 }
}
