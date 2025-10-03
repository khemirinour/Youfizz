import { BaseEntity } from '@you-fizz/shared';
import { Column, Entity, Index } from 'typeorm';

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('articles')
export class Article extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  price!: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sku?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoryId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vendorId?: string;

  @Column({ type: 'jsonb', nullable: true })
  images?: string[];

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status!: ArticleStatus;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}


