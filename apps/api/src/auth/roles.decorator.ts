import { SetMetadata } from '@nestjs/common';
import type { Role } from './role';
export const ROLES_KEY = 'fieldops:roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
