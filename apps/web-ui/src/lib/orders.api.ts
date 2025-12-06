import { post, get, patch, put, del } from './http';
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

export interface UpdateOrderDto extends Partial<CreateOrderDto> {}

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

export async function createOrder(data: CreateOrderDto): Promise<Order | undefined> {
  const response = await post<OrderResponse | Order>('/api/orders', data);
  
  if (!response) {
    return undefined;
  }
  
  // Check if response is already transformed (has orderNumber) or needs transformation (has number)
  const transformed = 'orderNumber' in response 
    ? response as Order
    : transformOrderResponse(response as OrderResponse);
  
  // Clear cache to force refresh
  const { clearCache } = useOrdersStore.getState();
  clearCache();
  
  return transformed;
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

export async function getOrder(id: string): Promise<Order | undefined> {
  // Get cached data from store (we could cache individual orders too, but for now just fetch)
  const response = await get<OrderResponse>(`/api/orders/${id}`);
  
  // If response is undefined (304 Not Modified), we'd need individual order cache
  // For now, return undefined if no response
  if (!response) {
    return undefined;
  }
  
  return transformOrderResponse(response);
}

export async function updateOrder(id: string, data: UpdateOrderDto): Promise<Order | undefined> {
  const response = await patch<OrderResponse>(`/api/orders/${id}`, data);  // Changed from put to patch
  
  if (!response) {
    return undefined;
  }
  
  const transformed = transformOrderResponse(response);
  
  // Clear cache for all orders to force refresh
  const { clearCache } = useOrdersStore.getState();
  clearCache();
  
  return transformed;
}

export async function deleteOrder(id: string): Promise<{ message?: string } | undefined> {
  const response = await del<{ message?: string }>(`/api/orders/${id}`);
  
  // Clear cache after deletion
  const { clearCache } = useOrdersStore.getState();
  clearCache();
  
  return response;
}

export async function confirmOrder(id: string, idvendor?: string): Promise<Order | undefined> {
  const body = idvendor ? { idvendor } : {};
  const response = await patch<OrderResponse>(`/api/orders/${id}/confirm`, body);
  
  if (!response) {
    return undefined;
  }
  
  const transformed = transformOrderResponse(response);
  
  // Clear cache to force refresh
  const { clearCache } = useOrdersStore.getState();
  clearCache();
  
  return transformed;
}

export async function activateOrder(id: string): Promise<Order | undefined> {
  const response = await patch<OrderResponse>(`/api/orders/${id}/activate`, {});
  
  if (!response) {
    return undefined;
  }
  
  const transformed = transformOrderResponse(response);
  
  // Clear cache to force refresh
  const { clearCache } = useOrdersStore.getState();
  clearCache();
  
  return transformed;
}

export async function deactivateOrder(id: string): Promise<Order | undefined> {
  const response = await patch<OrderResponse>(`/api/orders/${id}/deactivate`, {});
  
  if (!response) {
    return undefined;
  }
  
  const transformed = transformOrderResponse(response);
  
  // Clear cache to force refresh
  const { clearCache } = useOrdersStore.getState();
  clearCache();
  
  return transformed;
}

export async function updateOrderStatus(
  id: string, 
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
): Promise<Order | undefined> {
  const response = await patch<OrderResponse>(`/api/orders/${id}`, { status });
  
  if (!response) {
    return undefined;
  }
  
  const transformed = transformOrderResponse(response);
  
  // Clear cache to force refresh
  const { clearCache } = useOrdersStore.getState();
  clearCache();
  
  return transformed;
}

export async function updateOrderPaid(id: string, isPaid: boolean): Promise<Order | undefined> {
  const response = await patch<OrderResponse>(`/api/orders/${id}`, { isPaid });
  
  if (!response) {
    return undefined;
  }
  
  const transformed = transformOrderResponse(response);
  
  // Clear cache to force refresh
  const { clearCache } = useOrdersStore.getState();
  clearCache();
  
  return transformed;
}

