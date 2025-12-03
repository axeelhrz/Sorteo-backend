import { Controller, Get, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Obtiene las notificaciones del usuario autenticado
   */
  @Get()
  async getNotifications(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const [notifications, total] = await this.notificationService.findByUserId(
      user.id,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
      unreadOnly === 'true',
    );

    return {
      data: notifications,
      total,
    };
  }

  /**
   * Obtiene el contador de notificaciones no leídas
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationService.getUnreadCount(user.id);
    return { unreadCount: count };
  }

  /**
   * Marca una notificación como leída
   */
  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  @Put('mark-all-read')
  async markAllAsRead(@CurrentUser() user: any) {
    await this.notificationService.markAllAsRead(user.id);
    return { success: true };
  }

  /**
   * Obtiene las preferencias de notificación del usuario
   */
  @Get('preferences')
  async getPreferences(@CurrentUser() user: any) {
    return this.notificationService.getPreferences(user.id);
  }

  /**
   * Actualiza las preferencias de notificación
   */
  @Put('preferences')
  async updatePreferences(@CurrentUser() user: any, @Body() updates: any) {
    return this.notificationService.updatePreferences(user.id, updates);
  }

  /**
   * Elimina una notificación
   */
  @Put(':id/delete')
  async deleteNotification(@Param('id') id: string) {
    await this.notificationService.delete(id);
    return { success: true };
  }
}