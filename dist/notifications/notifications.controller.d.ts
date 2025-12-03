import { NotificationService } from './notification.service';
export declare class NotificationsController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    /**
     * Obtiene las notificaciones del usuario autenticado
     */
    getNotifications(user: any, limit?: string, offset?: string, unreadOnly?: string): Promise<{
        data: import("./notification.entity").Notification[];
        total: number;
    }>;
    /**
     * Obtiene el contador de notificaciones no leídas
     */
    getUnreadCount(user: any): Promise<{
        unreadCount: number;
    }>;
    /**
     * Marca una notificación como leída
     */
    markAsRead(id: string): Promise<import("./notification.entity").Notification>;
    /**
     * Marca todas las notificaciones como leídas
     */
    markAllAsRead(user: any): Promise<{
        success: boolean;
    }>;
    /**
     * Obtiene las preferencias de notificación del usuario
     */
    getPreferences(user: any): Promise<import("./notification-preference.entity").NotificationPreference>;
    /**
     * Actualiza las preferencias de notificación
     */
    updatePreferences(user: any, updates: any): Promise<import("./notification-preference.entity").NotificationPreference>;
    /**
     * Elimina una notificación
     */
    deleteNotification(id: string): Promise<{
        success: boolean;
    }>;
}
