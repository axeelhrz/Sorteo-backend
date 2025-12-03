"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationEventService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEventService = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const email_service_1 = require("./email.service");
const notification_entity_1 = require("./notification.entity");
/**
 * Servicio que coordina la emisión de notificaciones y emails
 * Mapea eventos de negocio a canales de comunicación
 */
let NotificationEventService = NotificationEventService_1 = class NotificationEventService {
    constructor(notificationService, emailService) {
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(NotificationEventService_1.name);
    }
    /**
     * Evento: Usuario compró tickets exitosamente
     */
    async onTicketPurchaseSuccess(data) {
        try {
            // Crear notificación interna
            await this.notificationService.create({
                userId: data.userId,
                type: notification_entity_1.NotificationType.PURCHASE_CONFIRMED,
                title: 'Compra confirmada',
                message: `Has comprado ${data.ticketQuantity} ticket(s) para el sorteo "${data.raffleName}"`,
                actionUrl: data.raffleUrl,
                metadata: {
                    ticketNumbers: data.ticketNumbers,
                    amount: data.amount,
                },
            });
            // Enviar email de confirmación
            const emailHtml = this.emailService.generatePurchaseConfirmationEmail(data);
            await this.emailService.send({
                to: data.userEmail,
                subject: `Confirmación de compra – ${data.raffleName}`,
                html: emailHtml,
            });
            this.logger.log(`Notificación de compra enviada a ${data.userEmail}`);
        }
        catch (error) {
            this.logger.error('Error enviando notificación de compra:', error);
        }
    }
    /**
     * Evento: Sorteo ejecutado - Notificar al ganador
     */
    async onRaffleExecutedWinner(data) {
        try {
            // Crear notificación interna al ganador
            await this.notificationService.create({
                userId: data.winnerId,
                type: notification_entity_1.NotificationType.RAFFLE_RESULT_WINNER,
                title: '¡Ganaste un sorteo!',
                message: `¡Felicidades! Ganaste el sorteo "${data.raffleName}" con el ticket #${data.ticketNumber}`,
                actionUrl: data.raffleUrl,
                metadata: {
                    ticketNumber: data.ticketNumber,
                    shopName: data.shopName,
                },
            });
            // Enviar email al ganador
            const emailHtml = this.emailService.generateWinnerEmail({
                winnerName: data.winnerName,
                raffleName: data.raffleName,
                shopName: data.shopName,
                ticketNumber: data.ticketNumber,
                shopEmail: data.shopEmail,
                shopPhone: data.shopPhone,
                raffleUrl: data.raffleUrl,
            });
            await this.emailService.send({
                to: data.winnerEmail,
                subject: `¡Ganaste el sorteo ${data.raffleName}!`,
                html: emailHtml,
            });
            this.logger.log(`Notificación de ganador enviada a ${data.winnerEmail}`);
        }
        catch (error) {
            this.logger.error('Error enviando notificación de ganador:', error);
        }
    }
    /**
     * Evento: Sorteo ejecutado - Notificar a la tienda
     */
    async onRaffleExecutedShop(data) {
        try {
            // Crear notificación interna a la tienda
            await this.notificationService.create({
                userId: data.shopId,
                type: notification_entity_1.NotificationType.RAFFLE_RESULT_WINNER,
                title: 'Tu sorteo tiene un ganador',
                message: `El sorteo "${data.raffleName}" ha sido ejecutado. Ganador: ${data.winnerName}`,
                actionUrl: data.shopDashboardUrl,
                metadata: {
                    ticketNumber: data.ticketNumber,
                    winnerName: data.winnerName,
                    winnerEmail: data.winnerEmail,
                },
            });
            // Enviar email a la tienda
            const emailHtml = this.emailService.generateShopWinnerNotificationEmail(data);
            await this.emailService.send({
                to: data.shopEmail,
                subject: `Tu sorteo "${data.raffleName}" tiene un ganador`,
                html: emailHtml,
            });
            this.logger.log(`Notificación de ganador enviada a tienda ${data.shopEmail}`);
        }
        catch (error) {
            this.logger.error('Error enviando notificación a tienda:', error);
        }
    }
    /**
     * Evento: Sorteo aprobado
     */
    async onRaffleApproved(data) {
        try {
            // Crear notificación interna
            await this.notificationService.create({
                userId: data.shopId,
                type: notification_entity_1.NotificationType.RAFFLE_APPROVED,
                title: 'Sorteo aprobado',
                message: `Tu sorteo "${data.raffleName}" ha sido aprobado y está activo en el marketplace`,
                actionUrl: data.marketplaceUrl,
            });
            // Enviar email
            const emailHtml = this.emailService.generateRaffleApprovedEmail(data);
            await this.emailService.send({
                to: data.shopEmail,
                subject: `Tu sorteo "${data.raffleName}" fue aprobado`,
                html: emailHtml,
            });
            this.logger.log(`Notificación de aprobación enviada a ${data.shopEmail}`);
        }
        catch (error) {
            this.logger.error('Error enviando notificación de aprobación:', error);
        }
    }
    /**
     * Evento: Sorteo rechazado
     */
    async onRaffleRejected(data) {
        try {
            // Crear notificación interna
            await this.notificationService.create({
                userId: data.shopId,
                type: notification_entity_1.NotificationType.RAFFLE_REJECTED,
                title: 'Sorteo rechazado',
                message: `Tu sorteo "${data.raffleName}" fue rechazado. Motivo: ${data.reason}`,
                actionUrl: data.dashboardUrl,
                metadata: { reason: data.reason },
            });
            // Enviar email
            const emailHtml = this.emailService.generateRaffleRejectedEmail(data);
            await this.emailService.send({
                to: data.shopEmail,
                subject: `Tu sorteo "${data.raffleName}" fue rechazado`,
                html: emailHtml,
            });
            this.logger.log(`Notificación de rechazo enviada a ${data.shopEmail}`);
        }
        catch (error) {
            this.logger.error('Error enviando notificación de rechazo:', error);
        }
    }
    /**
     * Evento: Sorteo cancelado
     */
    async onRaffleCancelled(data) {
        try {
            // Crear notificación interna
            await this.notificationService.create({
                userId: data.shopId,
                type: notification_entity_1.NotificationType.RAFFLE_CANCELLED,
                title: 'Sorteo cancelado',
                message: `Tu sorteo "${data.raffleName}" ha sido cancelado. Motivo: ${data.reason}`,
                actionUrl: data.dashboardUrl,
                metadata: { reason: data.reason },
            });
            this.logger.log(`Notificación de cancelación enviada a ${data.shopEmail}`);
        }
        catch (error) {
            this.logger.error('Error enviando notificación de cancelación:', error);
        }
    }
    /**
     * Evento: Tienda verificada
     */
    async onShopVerified(data) {
        try {
            // Crear notificación interna
            await this.notificationService.create({
                userId: data.shopId,
                type: notification_entity_1.NotificationType.SHOP_VERIFIED,
                title: 'Tienda verificada',
                message: 'Tu tienda ha sido verificada. Ahora puedes crear sorteos.',
                actionUrl: data.dashboardUrl,
            });
            // Enviar email
            const emailHtml = this.emailService.generateShopVerifiedEmail(data);
            await this.emailService.send({
                to: data.shopEmail,
                subject: 'Tu tienda ha sido verificada',
                html: emailHtml,
            });
            this.logger.log(`Notificación de verificación enviada a ${data.shopEmail}`);
        }
        catch (error) {
            this.logger.error('Error enviando notificación de verificación:', error);
        }
    }
    /**
     * Evento: Tienda bloqueada
     */
    async onShopBlocked(data) {
        try {
            // Crear notificación interna
            await this.notificationService.create({
                userId: data.shopId,
                type: notification_entity_1.NotificationType.SHOP_BLOCKED,
                title: 'Tienda bloqueada',
                message: `Tu tienda ha sido bloqueada. Motivo: ${data.reason}`,
                metadata: { reason: data.reason },
            });
            // Enviar email
            const emailHtml = this.emailService.generateShopBlockedEmail(data);
            await this.emailService.send({
                to: data.shopEmail,
                subject: 'Tu tienda ha sido bloqueada',
                html: emailHtml,
            });
            this.logger.log(`Notificación de bloqueo enviada a ${data.shopEmail}`);
        }
        catch (error) {
            this.logger.error('Error enviando notificación de bloqueo:', error);
        }
    }
    /**
     * Evento: Sorteo agotado (todos los tickets vendidos)
     */
    async onRaffleSoldOut(data) {
        try {
            // Crear notificación interna a la tienda
            await this.notificationService.create({
                userId: data.shopId,
                type: notification_entity_1.NotificationType.RAFFLE_SOLD_OUT,
                title: 'Sorteo agotado',
                message: `¡Todos los tickets del sorteo "${data.raffleName}" han sido vendidos! El sorteo se ejecutará automáticamente.`,
                actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
                metadata: {
                    raffleId: data.raffleId,
                    raffleName: data.raffleName,
                },
            });
            // Enviar email a la tienda
            const emailHtml = this.emailService.generateRaffleSoldOutEmail(data);
            await this.emailService.send({
                to: data.shopEmail,
                subject: `¡Tu sorteo "${data.raffleName}" está agotado!`,
                html: emailHtml,
            });
            this.logger.log(`Notificación de sorteo agotado enviada a ${data.shopEmail}`);
        }
        catch (error) {
            this.logger.error('Error enviando notificación de sorteo agotado:', error);
        }
    }
};
exports.NotificationEventService = NotificationEventService;
exports.NotificationEventService = NotificationEventService = NotificationEventService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        email_service_1.EmailService])
], NotificationEventService);
