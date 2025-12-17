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
  items!: Array<{
    articleId: string;
    qty: number;
    price: string;
    hasDelivery?: boolean;
    destination?: string;
    deliveryPrice?: string;
  }>;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  customerName?: string;
  @Column({ type: 'varchar', length: 100, nullable: true })
  customerEmail?: string;
  @Column({ type: 'varchar', length: 20, nullable: true })
  customerPhone?: string
  @Column({ type: 'varchar', length: 200, nullable: true })
  customerAddress?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vendorId?: string;

  @Column({ type: 'boolean', default: false })
  isPaid!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  remarque?: string;

  @Column({ type: 'integer', default: 0 })
  confirmationAttempts!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  confirmedByUserId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  confirmedByUserName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  confirmedByUserEmail?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastConfirmationAttemptAt?: Date;
}
