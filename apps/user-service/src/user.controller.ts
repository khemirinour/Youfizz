import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from '@you-fizz/shared';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.create')
  async create(@Payload() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @MessagePattern('user.findAll')
  async findAll(@Payload() data: { page?: number; limit?: number }) {
    return this.userService.findAll(data.page, data.limit);
  }

  @MessagePattern('user.findOne')
  async findOne(@Payload() id: string) {
    return this.userService.findOne(id);
  }

  @MessagePattern('user.update')
  async update(@Payload() data: { id: string } & UpdateUserDto) {
    const { id, ...updateData } = data;
    return this.userService.update(id, updateData);
  }

  @MessagePattern('user.remove')
  async remove(@Payload() id: string) {
    return this.userService.remove(id);
  }
}
