import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsIn, IsUUID } from 'class-validator';
export type Priority='LOW'|'MEDIUM'|'HIGH'|'CRITICAL';
export type Status='PENDING'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED';
export class CreateWorkOrderDto {
 @IsString() @IsNotEmpty() @MinLength(5) @MaxLength(100) title!:string;
 @IsOptional() @IsString() @MaxLength(500) description?:string;
 @IsOptional() @IsIn(['LOW','MEDIUM','HIGH','CRITICAL']) priority?:Priority;
 @IsOptional() @IsUUID() technicianId?:string;
}
