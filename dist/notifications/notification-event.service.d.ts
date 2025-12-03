import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
/**
 * Servicio que coordina la emisión de notificaciones y emails
 * Mapea eventos de negocio a canales de comunicación
 */
export declare class NotificationEventService {
    private notificationService;
    private emailService;
    private readonly logger;
    constructor(notificationService: NotificationService, emailService: EmailService);
    /**
     * Evento: Usuario compró tickets exitosamente
     */
    onTicketPurchaseSuccess(data: {
        userId: string;
        userEmail: string;
        userName: string;
        raffleName: string;
        shopName: string;
        ticketQuantity: number;
        ticketNumbers: number[];
        amount: number;
        currency: string;
        purchaseDate: Date;
        raffleUrl: string;
    }): Promise<void>;
    /**
     * Evento: Sorteo ejecutado - Notificar al ganador
     */
    onRaffleExecutedWinner(data: {
        winnerId: string;
        winnerEmail: string;
        winnerName: string;
        raffleName: string;
        shopName: string;
        shopEmail: string;
        shopPhone?: string;
        ticketNumber: number;
        raffleUrl: string;
    }): Promise<void>;
    /**
     * Evento: Sorteo ejecutado - Notificar a la tienda
     */
    onRaffleExecutedShop(data: {
        shopId: string;
        shopEmail: string;
        shopName: string;
        raffleName: string;
        winnerName: string;
        winnerEmail: string;
        ticketNumber: number;
        shopDashboardUrl: string;
    }): Promise<void>;
    /**
     * Evento: Sorteo aprobado
     */
    onRaffleApproved(data: {
        shopId: string;
        shopEmail: string;
        shopName: string;
        raffleName: string;
        marketplaceUrl: string;
    }): Promise<void>;
    /**
     * Evento: Sorteo rechazado
     */
    onRaffleRejected(data: {
        shopId: string;
        shopEmail: string;
        shopName: string;
        raffleName: string;
        reason: string;
        dashboardUrl: string;
    }): Promise<void>;
    /**
     * Evento: Sorteo cancelado
     */
    onRaffleCancelled(data: {
        shopId: string;
        shopEmail: string;
        shopName: string;
        raffleName: string;
        reason: string;
        dashboardUrl: string;
    }): Promise<void>;
    /**
     * Evento: Tienda verificada
     */
    onShopVerified(data: {
        shopId: string;
        shopEmail: string;
        shopName: string;
        dashboardUrl: string;
    }): Promise<void>;
    /**
     * Evento: Tienda bloqueada
     */
    onShopBlocked(data: {
        shopId: string;
        shopEmail: string;
        shopName: string;
        reason: string;
        supportEmail: string;
    }): Promise<void>;
    /**
     * Evento: Sorteo agotado (todos los tickets vendidos)
     */
    onRaffleSoldOut(data: {
        raffleId: string;
        raffleName: string;
        shopId: string;
        shopEmail: string;
        shopName: string;
    }): Promise<void>;
}
