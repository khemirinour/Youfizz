import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '@you-fizz/shared';

export enum UserRole {
  ADMIN = 'admin',
  VENDEUR = 'vendeur',
  CONFERMATEUR = 'confermateur',
  GUEST = 'guest'
}

@Entity('users')
@Unique(['email'])
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.GUEST 
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;
}

