import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Principal } from './role';
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Principal =>
    context.switchToHttp().getRequest<{ user: Principal }>().user,
);
