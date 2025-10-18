import { Entity, Column, Unique, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@you-fizz/shared';
import * as bcrypt from 'bcrypt';

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
  @Exclude({ toPlainOnly: true })
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

  @Column({ nullable: true })
  passwordChangedAt: Date;

  @Column({ nullable: true })
  salt: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      // Hash the password with bcrypt (salt is automatically generated and embedded)
      this.password = await bcrypt.hash(this.password, 12);
      
      // Clear the separate salt since bcrypt embeds it in the hash
      this.salt = null;
      
      // Update password changed timestamp
      this.passwordChangedAt = new Date();
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }
    
    try {
      // First try standard bcrypt comparison (for new passwords)
      if (await bcrypt.compare(plainPassword, this.password)) {
        return true;
      }
      
      // If that fails and we have a separate salt, try the old method
      if (this.salt) {
        const oldHash = await bcrypt.hash(plainPassword, this.salt);
        if (oldHash === this.password) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  toJSON() {
    const { password, salt, ...user } = this;
    return user;
  }
}
