export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private transporter;
    private readonly logger;
    constructor();
    /**
     * Envía un email
     */
    send(options: EmailOptions): Promise<boolean>;
    /**
     * Plantilla: Confirmación de compra de tickets
     */
    generatePurchaseConfirmationEmail(data: {
        userName: string;
        raffleName: string;
        shopName: string;
        ticketQuantity: number;
        ticketNumbers: number[];
        amount: number;
        currency: string;
        purchaseDate: Date;
        raffleUrl: string;
    }): string;
    /**
     * Plantilla: Ganaste el sorteo
     */
    generateWinnerEmail(data: {
        winnerName: string;
        raffleName: string;
        shopName: string;
        ticketNumber: number;
        shopEmail: string;
        shopPhone?: string;
        raffleUrl: string;
    }): string;
    /**
     * Plantilla: Notificación a tienda sobre ganador
     */
    generateShopWinnerNotificationEmail(data: {
        shopName: string;
        raffleName: string;
        winnerName: string;
        winnerEmail: string;
        ticketNumber: number;
        shopDashboardUrl: string;
    }): string;
    /**
     * Plantilla: Sorteo aprobado
     */
    generateRaffleApprovedEmail(data: {
        shopName: string;
        raffleName: string;
        marketplaceUrl: string;
    }): string;
    /**
     * Plantilla: Sorteo rechazado
     */
    generateRaffleRejectedEmail(data: {
        shopName: string;
        raffleName: string;
        reason: string;
        dashboardUrl: string;
    }): string;
    /**
     * Plantilla: Tienda verificada
     */
    generateShopVerifiedEmail(data: {
        shopName: string;
        dashboardUrl: string;
    }): string;
    /**
     * Plantilla: Tienda bloqueada
     */
    generateShopBlockedEmail(data: {
        shopName: string;
        reason: string;
        supportEmail: string;
    }): string;
    /**
     * Plantilla: Sorteo agotado (todos los tickets vendidos)
     */
    generateRaffleSoldOutEmail(data: {
        shopName: string;
        raffleName: string;
        dashboardUrl?: string;
    }): string;
}
