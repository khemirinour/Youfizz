import { SetMetadata } from '@nestjs/common';

export type UserRole = 'ADMIN' | 'VENDEUR' | 'CONFIRMATEUR' | 'CLIENT';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);


