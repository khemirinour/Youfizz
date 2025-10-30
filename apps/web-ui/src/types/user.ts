export type UserRole = 'ADMIN' | 'VENDEUR' | 'CONFERMATEUR' | 'GUEST';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
}


