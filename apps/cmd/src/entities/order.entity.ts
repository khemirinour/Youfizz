import { BaseEntity } from '@you-fizz/shared';
import { Column, Entity, Index } from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 30, unique: true })
  number!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ type: 'jsonb' })
  items!: Array<{ articleId: string; qty: number; price: string }>;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total!: string;

  @Column({ type: 'varchar', length: 50 })
  customerId!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vendorId?: string;

  @Column({ type: 'boolean', default: false })
  isPaid!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}


