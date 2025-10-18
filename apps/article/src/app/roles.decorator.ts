import { SetMetadata } from '@nestjs/common';

export type UserRole = 'admin' | 'vendeur' | 'confermateur' | 'guest';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);


