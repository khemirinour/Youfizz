import { create } from 'zustand';
import type { AdminUser, UserRole } from '@/types/user';
import type { Paginated } from '@/types/pagination';
import type { UserStats, OrderStats, ArticleStats } from '@/lib/admin.api';

interface AdminState {
  usersCache: Record<string, Paginated<AdminUser>>;
  userByIdCache: Record<string, AdminUser>;
  confermateursCache: AdminUser[] | null;
  userStatsCache: UserStats | null;
  orderStatsCache: OrderStats | null;
  articleStatsCache: ArticleStats | null;
}

interface AdminActions {
  setCachedUsers: (key: string, data: Paginated<AdminUser>) => void;
  getCachedUsers: (key: string) => Paginated<AdminUser> | undefined;
  setCachedUserById: (id: string, data: AdminUser) => void;
  getCachedUserById: (id: string) => AdminUser | undefined;
  setCachedConfermateurs: (data: AdminUser[]) => void;
  getCachedConfermateurs: () => AdminUser[] | null;
  setCachedUserStats: (data: UserStats) => void;
  getCachedUserStats: () => UserStats | null;
  setCachedOrderStats: (data: OrderStats) => void;
  getCachedOrderStats: () => OrderStats | null;
  setCachedArticleStats: (data: ArticleStats) => void;
  getCachedArticleStats: () => ArticleStats | null;
  clearCache: () => void;
}

type AdminStore = AdminState & AdminActions;

// Helper function to generate cache key for users
export function generateUsersCacheKey(params?: {
  role?: UserRole;
  page?: number;
  limit?: number;
}): string {
  if (!params) return 'users:default';
  
  const parts = [
    params.role || 'all',
    params.page?.toString() || '1',
    params.limit?.toString() || '10',
  ];
  
  return `users:${parts.join(':')}`;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial state
  usersCache: {},
  userByIdCache: {},
  confermateursCache: null,
  userStatsCache: null,
  orderStatsCache: null,
  articleStatsCache: null,

  // Actions
  setCachedUsers: (key: string, data: Paginated<AdminUser>) => {
    set((state) => ({
      usersCache: {
        ...state.usersCache,
        [key]: data,
      },
    }));
  },

  getCachedUsers: (key: string) => {
    return get().usersCache[key];
  },

  setCachedUserById: (id: string, data: AdminUser) => {
    set((state) => ({
      userByIdCache: {
        ...state.userByIdCache,
        [id]: data,
      },
    }));
  },

  getCachedUserById: (id: string) => {
    return get().userByIdCache[id];
  },

  setCachedConfermateurs: (data: AdminUser[]) => {
    set({ confermateursCache: data });
  },

  getCachedConfermateurs: () => {
    return get().confermateursCache;
  },

  setCachedUserStats: (data: UserStats) => {
    set({ userStatsCache: data });
  },

  getCachedUserStats: () => {
    return get().userStatsCache;
  },

  setCachedOrderStats: (data: OrderStats) => {
    set({ orderStatsCache: data });
  },

  getCachedOrderStats: () => {
    return get().orderStatsCache;
  },

  setCachedArticleStats: (data: ArticleStats) => {
    set({ articleStatsCache: data });
  },

  getCachedArticleStats: () => {
    return get().articleStatsCache;
  },

  clearCache: () => {
    set({
      usersCache: {},
      userByIdCache: {},
      confermateursCache: null,
      userStatsCache: null,
      orderStatsCache: null,
      articleStatsCache: null,
    });
  },
}));

