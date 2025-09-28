import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from '@you-fizz/shared';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('notification.send')
  async send(@Payload() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.send(createNotificationDto);
  }

  @MessagePattern('notification.getUserNotifications')
  async getUserNotifications(@Payload() data: { userId: string; page?: number; limit?: number }) {
    return this.notificationService.getUserNotifications(data.userId, data.page, data.limit);
  }

  @MessagePattern('notification.markAsRead')
  async markAsRead(@Payload() id: string) {
    return this.notificationService.markAsRead(id);
  }
}
