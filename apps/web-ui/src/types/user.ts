export type UserRole = 'admin' | 'vendeur' | 'confermateur' | 'guest';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
  nbrCmdConf?: number;
  vendeurs?: Array<{ id: string; firstName: string; lastName: string }>;
}


