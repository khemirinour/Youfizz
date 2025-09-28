import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto, UpdateUserDto } from '@you-fizz/shared';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return firstValueFrom(
      this.userClient.send('user.create', createUserDto),
    );
  }

  async findAll(page?: number, limit?: number) {
    return firstValueFrom(
      this.userClient.send('user.findAll', { page, limit }),
    );
  }

  async findOne(id: string) {
    return firstValueFrom(
      this.userClient.send('user.findOne', id),
    );
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return firstValueFrom(
      this.userClient.send('user.update', { id, ...updateUserDto }),
    );
  }

  async remove(id: string) {
    return firstValueFrom(
      this.userClient.send('user.remove', id),
    );
  }
}
