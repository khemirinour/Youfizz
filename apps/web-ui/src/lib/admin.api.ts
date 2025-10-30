import { get, del, put } from './http';
import type { AdminUser, UserRole } from '@/types/user';
import type { Paginated } from '@/types/pagination';

// Base path for auth service from gateway
const AUTH_BASE = '/api';

export async function getUsers(params?: { role?: UserRole; page?: number; limit?: number }): Promise<Paginated<AdminUser>> {
  const q = { role: params?.role, page: params?.page ?? 1, limit: params?.limit ?? 10 };
  return get<Paginated<AdminUser>>(`${AUTH_BASE}/users`, q);
}

export async function getUser(id: string): Promise<AdminUser> {
  return get<AdminUser>(`${AUTH_BASE}/users/${id}`);
}

export async function updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
  return put<AdminUser>(`${AUTH_BASE}/users/${id}/role/${role}`, {});
}

export async function setUserActive(id: string, isActive: boolean): Promise<AdminUser> {
  return put<AdminUser>(`${AUTH_BASE}/users/${id}/active`, { isActive });
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  return del<{ message: string }>(`${AUTH_BASE}/users/${id}`);
}

// Confermateurs related
export async function listConfermateurs(): Promise<AdminUser[]> {
  return get<AdminUser[]>(`${AUTH_BASE}/confermateurs`);
}

export async function assignVendeurToConfermateur(confermateurId: string, vendeurId: string): Promise<{ message: string }> {
  return put<{ message: string }>(`${AUTH_BASE}/confermateurs/${confermateurId}/vendeurs/${vendeurId}`, {});
}

export async function unassignVendeurFromConfermateur(confermateurId: string, vendeurId: string): Promise<{ message: string }> {
  return del<{ message: string }>(`${AUTH_BASE}/confermateurs/${confermateurId}/vendeurs/${vendeurId}`);
}


