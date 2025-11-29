import { post, get, patch } from './http';
import { useOrdersStore, generateOrdersCacheKey } from '@/stores/ordersStore';

export interface OrderItemDto {
  articleId: string;
  qty: number;
  price: string; // Decimal string
}

export interface CreateOrderDto {
  items: OrderItemDto[];
  total: string; // Decimal string
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  vendorId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItemDto[];
  total: string;
  customerId?: string; // Made optional since API doesn't always return it
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  vendorId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  isPaid: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Backend response type (what we actually receive)
interface OrderResponse {
  id: string;
  number: string; // Backend uses 'number' not 'orderNumber'
  items: OrderItemDto[];
  total: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  vendorId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  isPaid: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface GetOrdersParams {
  search?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  vendorId?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface PaginatedOrdersResponse {
  items: Order[];
  total: number;
  limit: number;
  offset: number;
}

export async function createOrder(data: CreateOrderDto) {
  return post<Order>('/api/orders', data);
}

// Transform backend response to frontend format
function transformOrderResponse(order: OrderResponse): Order {
  return {
    ...order,
    orderNumber: order.number, // Map 'number' to 'orderNumber'
  };
}

export async function getOrders(params?: GetOrdersParams): Promise<PaginatedOrdersResponse | undefined> {
  // Generate cache key from params
  const cacheKey = generateOrdersCacheKey({
    vendorId: params?.vendorId,
    status: params?.status,
    search: params?.search,
    page: params?.offset ? Math.floor(params.offset / (params.limit || 20)) : 0,
    pageSize: params?.limit,
  });
  
  // Get cached data from store
  const { getCachedOrders, setCachedOrders } = useOrdersStore.getState();
  const cachedData = getCachedOrders(cacheKey);
  
  // Make API call
  const response = await get<OrderResponse[] | { items: OrderResponse[]; total: number; limit: number; offset: number }>('/api/orders', params);
  
  // If response is undefined (304 Not Modified), return cached data from store
  if (!response) {
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  }
  
  let result: PaginatedOrdersResponse | undefined;
  
  // Handle both array response and paginated response
  if (Array.isArray(response)) {
    // Empty array might indicate a 304 that was converted to 200 with empty data
    // Return cached data if available, otherwise undefined
    if (response.length === 0) {
      if (cachedData) {
        return cachedData;
      }
      return undefined;
    }
    result = {
      items: response.map(transformOrderResponse),
      total: response.length,
      limit: params?.limit || 20,
      offset: params?.offset || 0,
    };
  } else {
    // Paginated response format
    // Empty items array might indicate a 304 - return cached data if available
    if (!response.items || response.items.length === 0) {
      if (cachedData) {
        return cachedData;
      }
      return undefined;
    }
    
    result = {
      ...response,
      items: response.items.map(transformOrderResponse),
    };
  }
  
  // Update cache with new data
  if (result) {
    setCachedOrders(cacheKey, result);
  }
  
  return result;
}

export async function getOrder(id: string): Promise<Order> {
  const order = await get<OrderResponse>(`/api/orders/${id}`);
  return transformOrderResponse(order);
}

export async function confirmOrder(id: string): Promise<Order> {
  const order = await patch<OrderResponse>(`/api/orders/${id}/confirm`, {});
  return transformOrderResponse(order);
}

export async function activateOrder(id: string): Promise<Order> {
  const order = await patch<OrderResponse>(`/api/orders/${id}/activate`, {});
  return transformOrderResponse(order);
}

export async function deactivateOrder(id: string): Promise<Order> {
  const order = await patch<OrderResponse>(`/api/orders/${id}/deactivate`, {});
  return transformOrderResponse(order);
}

