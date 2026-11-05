export type Role = 'ADMIN' | 'SUPERVISOR' | 'TECHNICIAN';
export interface Principal {
  sub: string;
  email: string;
  role: Role;
}
