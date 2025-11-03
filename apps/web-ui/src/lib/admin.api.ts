import { get, del, put, patch, post } from './http';
import type { AdminUser, UserRole } from '@/types/user';
import type { Paginated } from '@/types/pagination';

// Base path for auth service from gateway
const AUTH_BASE = '/api/auth';

export async function getUsers(params?: { role?: UserRole; page?: number; limit?: number }): Promise<Paginated<AdminUser>> {
  const q = { role: params?.role, page: params?.page ?? 1, limit: params?.limit ?? 10 };
  return get<Paginated<AdminUser>>(`${AUTH_BASE}/users`, q);
}

export async function getUser(id: string): Promise<AdminUser> {
  return get<AdminUser>(`${AUTH_BASE}/users/${id}`);
}

export async function updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
  return patch<AdminUser>(`${AUTH_BASE}/users/${id}/role/${role}`, {});
}

export async function setUserActive(id: string, isActive: boolean): Promise<AdminUser> {
  return patch<AdminUser>(`${AUTH_BASE}/users/${id}/active`, { isActive });
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  return del<{ message: string }>(`${AUTH_BASE}/users/${id}`);
}

// Confermateurs related
export async function listConfermateurs(): Promise<AdminUser[]> {
  return get<AdminUser[]>(`${AUTH_BASE}/confermateurs`);
}

export async function assignVendeurToConfermateur(confermateurId: string, vendeurId: string): Promise<{ message: string }> {
  return post<{ message: string }>(`${AUTH_BASE}/confermateurs/${confermateurId}/vendeurs/${vendeurId}`, {});
}

export async function unassignVendeurFromConfermateur(confermateurId: string, vendeurId: string): Promise<{ message: string }> {
  return del<{ message: string }>(`${AUTH_BASE}/confermateurs/${confermateurId}/vendeurs/${vendeurId}`);
}

export async function incrementVendeurNbrCmdConf(userId: string, amount?: number): Promise<{ id: string; idUser: string; nbrCmdConf: number }> {
  return patch<{ id: string; idUser: string; nbrCmdConf: number }>(`${AUTH_BASE}/users/${userId}/vendeur/nbr-cmd-conf`, { amount });
}

// Statistics endpoints
export interface UserStats {
  total: number;
  byRole: Record<string, number>;
  active: number;
  inactive: number;
  vendeursWithCmdConf: number;
}

export interface OrderStats {
  total: number;
  byStatus: Record<string, number>;
  paid: number;
  unpaid: number;
  active: number;
  inactive: number;
  totalRevenue: number;
}

export interface ArticleStats {
  total: number;
  byStatus: Record<string, number>;
  active: number;
  inactive: number;
  totalStock: number;
}

export async function getUserStats(): Promise<UserStats> {
  return get<UserStats>(`${AUTH_BASE}/stats/users`);
}

export async function getOrderStats(): Promise<OrderStats> {
  return get<OrderStats>(`/api/stats/orders`);
}

export async function getArticleStats(): Promise<ArticleStats> {
  return get<ArticleStats>(`/api/stats/articles`);
}

