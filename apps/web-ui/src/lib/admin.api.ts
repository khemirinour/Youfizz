import { get, del, put, patch, post } from './http';
import type { AdminUser, UserRole } from '@/types/user';
import type { Paginated } from '@/types/pagination';
import { useAdminStore, generateUsersCacheKey } from '@/stores/adminStore';

// Base path for auth service from gateway
const AUTH_BASE = '/api/auth';
const STATS_BASE = '/api';

export async function getUsers(params?: { role?: UserRole; page?: number; limit?: number }): Promise<Paginated<AdminUser> | undefined> {
  // Generate cache key from params
  const cacheKey = generateUsersCacheKey({
    role: params?.role,
    page: params?.page,
    limit: params?.limit,
  });
  
  // Get cached data from store
  const { getCachedUsers, setCachedUsers } = useAdminStore.getState();
  const cachedData = getCachedUsers(cacheKey);
  
  const q: any = { page: params?.page ?? 1, limit: params?.limit ?? 10 };
  // Only include role in query if it's explicitly provided and not undefined
  if (params?.role !== undefined && params?.role !== null) {
    q.role = params.role;
  }
  
  // Make API call
  const response = await get<Paginated<AdminUser>>(`${AUTH_BASE}/users`, q);
  
  // If response is undefined (304 Not Modified), return cached data from store
  if (!response) {
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  }
  
  // Update cache with new data
  setCachedUsers(cacheKey, response);
  
  return response;
}

export async function getUser(id: string): Promise<AdminUser | undefined> {
  // Get cached data from store
  const { getCachedUserById, setCachedUserById } = useAdminStore.getState();
  const cachedData = getCachedUserById(id);
  
  // Make API call
  const response = await get<AdminUser>(`${AUTH_BASE}/users/${id}`);
  
  // If response is undefined (304 Not Modified), return cached data from store
  if (!response) {
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  }
  
  // Update cache with new data
  setCachedUserById(id, response);
  
  return response;
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
export async function listConfermateurs(): Promise<AdminUser[] | undefined> {
  // Get cached data from store
  const { getCachedConfermateurs, setCachedConfermateurs } = useAdminStore.getState();
  const cachedData = getCachedConfermateurs();
  
  // Make API call
  const response = await get<AdminUser[]>(`${AUTH_BASE}/confermateurs`);
  
  // If response is undefined (304 Not Modified), return cached data from store
  if (!response) {
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  }
  
  // Empty array might indicate a 304 - return cached data if available
  if (response.length === 0 && cachedData) {
    return cachedData;
  }
  
  // Update cache with new data
  setCachedConfermateurs(response);
  
  return response;
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

export async function getUserStats(): Promise<UserStats | undefined> {
  // Get cached data from store
  const { getCachedUserStats, setCachedUserStats } = useAdminStore.getState();
  const cachedData = getCachedUserStats();
  
  // Make API call
  const response = await get<UserStats>(`${STATS_BASE}/stats/users`);
  
  // If response is undefined (304 Not Modified), return cached data from store
  if (!response) {
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  }
  
  // Update cache with new data
  setCachedUserStats(response);
  
  return response;
}

export async function getOrderStats(): Promise<OrderStats | undefined> {
  // Get cached data from store
  const { getCachedOrderStats, setCachedOrderStats } = useAdminStore.getState();
  const cachedData = getCachedOrderStats();
  
  // Make API call
  const response = await get<OrderStats>(`${STATS_BASE}/stats/orders`);
  
  // If response is undefined (304 Not Modified), return cached data from store
  if (!response) {
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  }
  
  // Update cache with new data
  setCachedOrderStats(response);
  
  return response;
}

export async function getArticleStats(): Promise<ArticleStats | undefined> {
  // Get cached data from store
  const { getCachedArticleStats, setCachedArticleStats } = useAdminStore.getState();
  const cachedData = getCachedArticleStats();
  
  // Make API call
  const response = await get<ArticleStats>(`${STATS_BASE}/stats/articles`);
  
  // If response is undefined (304 Not Modified), return cached data from store
  if (!response) {
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  }
  
  // Update cache with new data
  setCachedArticleStats(response);
  
  return response;
}

