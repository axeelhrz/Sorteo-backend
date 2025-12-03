import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { NotificationType } from './notification.entity';

/**
 * Servicio que coordina la emisión de notificaciones y emails
 * Mapea eventos de negocio a canales de comunicación
 */
@Injectable()
export class NotificationEventService {
  private readonly logger = new Logger(NotificationEventService.name);

  constructor(
    private notificationService: NotificationService,
    private emailService: EmailService,
  ) {}

  /**
   * Evento: Usuario compró tickets exitosamente
   */
  async onTicketPurchaseSuccess(data: {
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
  }): Promise<void> {
    try {
      // Crear notificación interna
      await this.notificationService.create({
        userId: data.userId,
        type: NotificationType.PURCHASE_CONFIRMED,
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
    } catch (error) {
      this.logger.error('Error enviando notificación de compra:', error);
    }
  }

  /**
   * Evento: Sorteo ejecutado - Notificar al ganador
   */
  async onRaffleExecutedWinner(data: {
    winnerId: string;
    winnerEmail: string;
    winnerName: string;
    raffleName: string;
    shopName: string;
    shopEmail: string;
    shopPhone?: string;
    ticketNumber: number;
    raffleUrl: string;
  }): Promise<void> {
    try {
      // Crear notificación interna al ganador
      await this.notificationService.create({
        userId: data.winnerId,
        type: NotificationType.RAFFLE_RESULT_WINNER,
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
    } catch (error) {
      this.logger.error('Error enviando notificación de ganador:', error);
    }
  }

  /**
   * Evento: Sorteo ejecutado - Notificar a la tienda
   */
  async onRaffleExecutedShop(data: {
    shopId: string;
    shopEmail: string;
    shopName: string;
    raffleName: string;
    winnerName: string;
    winnerEmail: string;
    ticketNumber: number;
    shopDashboardUrl: string;
  }): Promise<void> {
    try {
      // Crear notificación interna a la tienda
      await this.notificationService.create({
        userId: data.shopId,
        type: NotificationType.RAFFLE_RESULT_WINNER,
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
    } catch (error) {
      this.logger.error('Error enviando notificación a tienda:', error);
    }
  }

  /**
   * Evento: Sorteo aprobado
   */
  async onRaffleApproved(data: {
    shopId: string;
    shopEmail: string;
    shopName: string;
    raffleName: string;
    marketplaceUrl: string;
  }): Promise<void> {
    try {
      // Crear notificación interna
      await this.notificationService.create({
        userId: data.shopId,
        type: NotificationType.RAFFLE_APPROVED,
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
    } catch (error) {
      this.logger.error('Error enviando notificación de aprobación:', error);
    }
  }

  /**
   * Evento: Sorteo rechazado
   */
  async onRaffleRejected(data: {
    shopId: string;
    shopEmail: string;
    shopName: string;
    raffleName: string;
    reason: string;
    dashboardUrl: string;
  }): Promise<void> {
    try {
      // Crear notificación interna
      await this.notificationService.create({
        userId: data.shopId,
        type: NotificationType.RAFFLE_REJECTED,
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
    } catch (error) {
      this.logger.error('Error enviando notificación de rechazo:', error);
    }
  }

  /**
   * Evento: Sorteo cancelado
   */
  async onRaffleCancelled(data: {
    shopId: string;
    shopEmail: string;
    shopName: string;
    raffleName: string;
    reason: string;
    dashboardUrl: string;
  }): Promise<void> {
    try {
      // Crear notificación interna
      await this.notificationService.create({
        userId: data.shopId,
        type: NotificationType.RAFFLE_CANCELLED,
        title: 'Sorteo cancelado',
        message: `Tu sorteo "${data.raffleName}" ha sido cancelado. Motivo: ${data.reason}`,
        actionUrl: data.dashboardUrl,
        metadata: { reason: data.reason },
      });

      this.logger.log(`Notificación de cancelación enviada a ${data.shopEmail}`);
    } catch (error) {
      this.logger.error('Error enviando notificación de cancelación:', error);
    }
  }

  /**
   * Evento: Tienda verificada
   */
  async onShopVerified(data: {
    shopId: string;
    shopEmail: string;
    shopName: string;
    dashboardUrl: string;
  }): Promise<void> {
    try {
      // Crear notificación interna
      await this.notificationService.create({
        userId: data.shopId,
        type: NotificationType.SHOP_VERIFIED,
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
    } catch (error) {
      this.logger.error('Error enviando notificación de verificación:', error);
    }
  }

  /**
   * Evento: Tienda bloqueada
   */
  async onShopBlocked(data: {
    shopId: string;
    shopEmail: string;
    shopName: string;
    reason: string;
    supportEmail: string;
  }): Promise<void> {
    try {
      // Crear notificación interna
      await this.notificationService.create({
        userId: data.shopId,
        type: NotificationType.SHOP_BLOCKED,
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
    } catch (error) {
      this.logger.error('Error enviando notificación de bloqueo:', error);
    }
  }

  /**
   * Evento: Sorteo agotado (todos los tickets vendidos)
   */
  async onRaffleSoldOut(data: {
    raffleId: string;
    raffleName: string;
    shopId: string;
    shopEmail: string;
    shopName: string;
  }): Promise<void> {
    try {
      // Crear notificación interna a la tienda
      await this.notificationService.create({
        userId: data.shopId,
        type: NotificationType.RAFFLE_SOLD_OUT,
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
    } catch (error) {
      this.logger.error('Error enviando notificación de sorteo agotado:', error);
    }
  }
}