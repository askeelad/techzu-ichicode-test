import { AppDataSource } from '../../config/database.config';
import { Notification, NotificationType } from './notification.entity';

export const notificationRepository = AppDataSource.getRepository(Notification).extend({
  async createNotification(data: {
    recipient_id: string;
    actor_id: string;
    post_id: string;
    type: NotificationType;
  }): Promise<Notification> {
    const notification = this.create(data);
    return this.save(notification);
  },
});
