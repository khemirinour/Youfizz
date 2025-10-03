import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async onModuleInit() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@youfizz.local';
    const exists = await this.userRepo.findOne({ where: { email: adminEmail } });
    if (exists) return;

    const saltRounds = 10;
    const password = process.env.ADMIN_PASSWORD || 'admin1234';
    const hash = await bcrypt.hash(password, saltRounds);

    await this.userRepo.save(
      this.userRepo.create({
        email: adminEmail,
        password: hash,
        role: UserRole.ADMIN,
        isActive: true,
        firstName: 'Admin',
        lastName: 'User',
      })
    );
  }
}



