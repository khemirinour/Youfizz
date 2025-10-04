import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@you-fizz/shared';
import { User } from './user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken extends BaseEntity {
  @Index()
  @Column({ unique: true })
  token: string;

  @Column()
  userId: string;

  @Column()
  expiresAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  usedAt?: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

