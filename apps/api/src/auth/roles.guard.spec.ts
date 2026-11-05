import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import type { ExecutionContext } from '@nestjs/common';
describe('RolesGuard',()=>{
 it('rejects actors without required roles',()=>{
  const reflector={getAllAndOverride:()=>['ADMIN']} as unknown as Reflector;
  const context={
   getHandler:()=>()=>{},getClass:()=>class Example{},
   switchToHttp:()=>({getRequest:()=>({user:{role:'TECHNICIAN'}})})
  } as unknown as ExecutionContext;
  expect(()=>new RolesGuard(reflector).canActivate(context)).toThrow('Insufficient permissions');
 });
});
