import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import type { Priority, Status } from './create-work-order.dto';
export class UpdateWorkOrderDto {
 @IsOptional() @IsString() @MinLength(5) @MaxLength(100) title?:string;
 @IsOptional() @IsString() @MaxLength(500) description?:string;
 @IsOptional() @IsIn(['LOW','MEDIUM','HIGH','CRITICAL']) priority?:Priority;
 @IsOptional() @IsIn(['PENDING','IN_PROGRESS','COMPLETED','CANCELLED']) status?:Status;
 @IsOptional() @IsUUID() technicianId?:string;
}
