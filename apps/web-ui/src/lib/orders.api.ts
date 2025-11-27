import { post, get, patch } from './http';

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
  customerId: string;
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

export async function getOrders(params?: GetOrdersParams): Promise<PaginatedOrdersResponse> {
  return get<PaginatedOrdersResponse>('/api/orders', params);
}

export async function getOrder(id: string): Promise<Order> {
  return get<Order>(`/api/orders/${id}`);
}

export async function confirmOrder(id: string): Promise<Order> {
  return patch<Order>(`/api/orders/${id}/confirm`, {});
}

export async function activateOrder(id: string): Promise<Order> {
  return patch<Order>(`/api/orders/${id}/activate`, {});
}

export async function deactivateOrder(id: string): Promise<Order> {
  return patch<Order>(`/api/orders/${id}/deactivate`, {});
}

