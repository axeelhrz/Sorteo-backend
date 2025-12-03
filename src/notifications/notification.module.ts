import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationPreference } from './notification-preference.entity';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { NotificationEventService } from './notification-event.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationPreference])],
  controllers: [NotificationsController],
  providers: [NotificationService, EmailService, NotificationEventService],
  exports: [NotificationService, EmailService, NotificationEventService],
})
export class NotificationModule {}