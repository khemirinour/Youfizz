import { post } from './http';

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

export async function createOrder(data: CreateOrderDto) {
  return post<Order>('/api/orders', data);
}

