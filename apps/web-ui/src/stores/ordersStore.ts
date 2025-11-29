import { create } from 'zustand';
import { Order } from '@/lib/orders.api';

interface OrdersCache {
  items: Order[];
  total: number;
  limit: number;
  offset: number;
}

interface OrdersState {
  cache: Record<string, OrdersCache>;
}

interface OrdersActions {
  setCachedOrders: (key: string, data: OrdersCache) => void;
  getCachedOrders: (key: string) => OrdersCache | undefined;
  clearCache: () => void;
  clearCacheByKey: (key: string) => void;
}

type OrdersStore = OrdersState & OrdersActions;

// Helper function to generate cache key from params
export function generateOrdersCacheKey(params?: {
  vendorId?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): string {
  if (!params) return 'orders:default';
  
  const parts = [
    params.vendorId || 'all',
    params.status || 'ALL',
    params.search || '',
    params.page?.toString() || '0',
    params.pageSize?.toString() || '20',
  ];
  
  return `orders:${parts.join(':')}`;
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  // Initial state
  cache: {},

  // Actions
  setCachedOrders: (key: string, data: OrdersCache) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: data,
      },
    }));
  },

  getCachedOrders: (key: string) => {
    return get().cache[key];
  },

  clearCache: () => {
    set({ cache: {} });
  },

  clearCacheByKey: (key: string) => {
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[key];
      return { cache: newCache };
    });
  },
}));

