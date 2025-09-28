import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto, NotificationEntity } from '@you-fizz/shared';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
  ) {}

  async send(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      userId: createNotificationDto.userId,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      type: createNotificationDto.type || 'info',
      isRead: false,
    });

    const savedNotification = await this.notificationRepository.save(notification);
    
    // In a real app, you would send the notification via email, SMS, push notification, etc.
    console.log(`📧 Notification sent to user ${savedNotification.userId}: ${savedNotification.title}`);
    
    return {
      id: savedNotification.id,
      userId: savedNotification.userId,
      title: savedNotification.title,
      message: savedNotification.message,
      type: savedNotification.type,
      isRead: savedNotification.isRead,
      createdAt: savedNotification.createdAt,
    };
  }

  async getUserNotifications(userId: string, page?: number, limit?: number) {
    const skip = page && limit ? (page - 1) * limit : 0;
    const take = limit || 10;
    
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
    
    return {
      data: notifications,
      total,
      page: page || 1,
      limit: take,
    };
  }

  async markAsRead(id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    const savedNotification = await this.notificationRepository.save(notification);
    
    return {
      id: savedNotification.id,
      userId: savedNotification.userId,
      title: savedNotification.title,
      message: savedNotification.message,
      type: savedNotification.type,
      isRead: savedNotification.isRead,
      createdAt: savedNotification.createdAt,
    };
  }
}
