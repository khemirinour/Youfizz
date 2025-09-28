import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateNotificationDto } from '@you-fizz/shared';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {}

  async send(createNotificationDto: CreateNotificationDto) {
    return firstValueFrom(
      this.notificationClient.send('notification.send', createNotificationDto),
    );
  }

  async getUserNotifications(userId: string, page?: number, limit?: number) {
    return firstValueFrom(
      this.notificationClient.send('notification.getUserNotifications', { userId, page, limit }),
    );
  }

  async markAsRead(id: string) {
    return firstValueFrom(
      this.notificationClient.send('notification.markAsRead', id),
    );
  }
}
