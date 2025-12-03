import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { NotificationPreference } from './notification-preference.entity';
import { EmailService } from './email.service';
import { Deposit } from '../deposits/deposit.entity';
import { Product } from '../products/product.entity';
import { Shop } from '../shops/shop.entity';
export declare class NotificationService {
    private notificationRepository;
    private preferenceRepository;
    private emailService;
    constructor(notificationRepository: Repository<Notification>, preferenceRepository: Repository<NotificationPreference>, emailService: EmailService);
    /**
     * Crea una notificación en la base de datos
     */
    create(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        actionUrl?: string;
        metadata?: any;
    }): Promise<Notification>;
    /**
     * Obtiene notificaciones por usuario
     */
    findByUserId(userId: string, limit?: number, offset?: number, unreadOnly?: boolean): Promise<[Notification[], number]>;
    /**
     * Obtiene el contador de notificaciones no leídas
     */
    getUnreadCount(userId: string): Promise<number>;
    /**
     * Marca una notificación como leída
     */
    markAsRead(id: string): Promise<Notification>;
    /**
     * Marca todas las notificaciones como leídas
     */
    markAllAsRead(userId: string): Promise<void>;
    /**
     * Obtiene las preferencias de notificación
     */
    getPreferences(userId: string): Promise<NotificationPreference>;
    /**
     * Actualiza las preferencias de notificación
     */
    updatePreferences(userId: string, updates: Partial<NotificationPreference>): Promise<NotificationPreference>;
    /**
     * Elimina una notificación
     */
    delete(id: string): Promise<void>;
    /**
     * Notifica cuando se crea un depósito de garantía
     */
    notifyDepositCreated(shop: Shop, deposit: Deposit, product: Product): Promise<void>;
    /**
     * Notifica cuando se libera un depósito
     */
    notifyDepositReleased(deposit: Deposit): Promise<void>;
    /**
     * Notifica cuando se retiene un depósito
     */
    notifyDepositHeld(deposit: Deposit, reason: string): Promise<void>;
    /**
     * Notifica cuando se ejecuta un depósito
     */
    notifyDepositExecuted(deposit: Deposit): Promise<void>;
    /**
     * Obtiene una tienda por ID (helper)
     */
    private getShopById;
}
