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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
const notification_preference_entity_1 = require("./notification-preference.entity");
const email_service_1 = require("./email.service");
let NotificationService = class NotificationService {
    constructor(notificationRepository, preferenceRepository, emailService) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.emailService = emailService;
    }
    /**
     * Crea una notificación en la base de datos
     */
    async create(data) {
        const notification = this.notificationRepository.create({
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            actionUrl: data.actionUrl,
            metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            isRead: false,
        });
        return this.notificationRepository.save(notification);
    }
    /**
     * Obtiene notificaciones por usuario
     */
    async findByUserId(userId, limit = 50, offset = 0, unreadOnly = false) {
        const queryBuilder = this.notificationRepository
            .createQueryBuilder('notification')
            .where('notification.userId = :userId', { userId })
            .orderBy('notification.createdAt', 'DESC')
            .skip(offset)
            .take(limit);
        if (unreadOnly) {
            queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
        }
        return queryBuilder.getManyAndCount();
    }
    /**
     * Obtiene el contador de notificaciones no leídas
     */
    async getUnreadCount(userId) {
        return this.notificationRepository.count({
            where: { userId, isRead: false },
        });
    }
    /**
     * Marca una notificación como leída
     */
    async markAsRead(id) {
        const notification = await this.notificationRepository.findOne({
            where: { id },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        notification.isRead = true;
        notification.readAt = new Date();
        return this.notificationRepository.save(notification);
    }
    /**
     * Marca todas las notificaciones como leídas
     */
    async markAllAsRead(userId) {
        await this.notificationRepository.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
    }
    /**
     * Obtiene las preferencias de notificación
     */
    async getPreferences(userId) {
        let preferences = await this.preferenceRepository.findOne({
            where: { userId },
        });
        if (!preferences) {
            preferences = this.preferenceRepository.create({
                userId,
                emailPurchaseConfirmation: true,
                emailRaffleResult: true,
                emailRaffleStatusChange: true,
                emailShopStatusChange: true,
                emailPromotions: true,
                inAppNotifications: true,
            });
            preferences = await this.preferenceRepository.save(preferences);
        }
        return preferences;
    }
    /**
     * Actualiza las preferencias de notificación
     */
    async updatePreferences(userId, updates) {
        let preferences = await this.getPreferences(userId);
        Object.assign(preferences, updates);
        return this.preferenceRepository.save(preferences);
    }
    /**
     * Elimina una notificación
     */
    async delete(id) {
        await this.notificationRepository.delete(id);
    }
    /**
     * Notifica cuando se crea un depósito de garantía
     */
    async notifyDepositCreated(shop, deposit, product) {
        try {
            const shopEmail = shop.publicEmail || shop.user?.email;
            if (!shopEmail) {
                console.error('No email found for shop:', shop.id);
                return;
            }
            const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Depósito de Garantía Requerido</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${shop.name}</strong>,</p>
                <p>Se requiere un depósito de garantía para el sorteo de <strong>${product.name}</strong>.</p>
                <p><strong>Monto:</strong> $${deposit.amount}</p>
                <p><strong>Motivo:</strong> ${deposit.notes || 'N/A'}</p>
              </div>
            </div>
          </body>
        </html>
      `;
            await this.emailService.send({
                to: shopEmail,
                subject: 'Depósito de Garantía Requerido - Sorteo de ' + product.name,
                html: emailHtml,
            });
        }
        catch (error) {
            console.error('Error sending deposit created notification:', error);
        }
    }
    /**
     * Notifica cuando se libera un depósito
     */
    async notifyDepositReleased(deposit) {
        try {
            const shop = deposit.shop || (await this.getShopById(deposit.shopId));
            if (!shop) {
                console.error('Shop not found for deposit:', deposit.id);
                return;
            }
            const shopEmail = shop.publicEmail || shop.user?.email;
            if (!shopEmail) {
                console.error('No email found for shop:', shop.id);
                return;
            }
            const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Depósito de Garantía Liberado</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${shop.name}</strong>,</p>
                <p>Tu depósito ha sido liberado exitosamente. El sorteo se completó correctamente.</p>
                <p><strong>Monto:</strong> $${deposit.amount}</p>
                <p><strong>ID de depósito:</strong> ${deposit.id}</p>
              </div>
            </div>
          </body>
        </html>
      `;
            await this.emailService.send({
                to: shopEmail,
                subject: 'Depósito de Garantía Liberado',
                html: emailHtml,
            });
        }
        catch (error) {
            console.error('Error sending deposit released notification:', error);
        }
    }
    /**
     * Notifica cuando se retiene un depósito
     */
    async notifyDepositHeld(deposit, reason) {
        try {
            const shop = deposit.shop || (await this.getShopById(deposit.shopId));
            if (!shop) {
                console.error('Shop not found for deposit:', deposit.id);
                return;
            }
            const shopEmail = shop.publicEmail || shop.user?.email;
            if (!shopEmail) {
                console.error('No email found for shop:', shop.id);
                return;
            }
            const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Depósito de Garantía Retenido</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${shop.name}</strong>,</p>
                <p>Tu depósito ha sido retenido. Por favor contacta con soporte para más información.</p>
                <p><strong>Monto:</strong> $${deposit.amount}</p>
                <p><strong>ID de depósito:</strong> ${deposit.id}</p>
                <p><strong>Motivo:</strong> ${reason}</p>
              </div>
            </div>
          </body>
        </html>
      `;
            await this.emailService.send({
                to: shopEmail,
                subject: 'Depósito de Garantía Retenido',
                html: emailHtml,
            });
        }
        catch (error) {
            console.error('Error sending deposit held notification:', error);
        }
    }
    /**
     * Notifica cuando se ejecuta un depósito
     */
    async notifyDepositExecuted(deposit) {
        try {
            const shop = deposit.shop || (await this.getShopById(deposit.shopId));
            if (!shop) {
                console.error('Shop not found for deposit:', deposit.id);
                return;
            }
            const shopEmail = shop.publicEmail || shop.user?.email;
            if (!shopEmail) {
                console.error('No email found for shop:', shop.id);
                return;
            }
            const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Depósito de Garantía Ejecutado</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${shop.name}</strong>,</p>
                <p>Tu depósito ha sido ejecutado. El premio fue entregado al ganador.</p>
                <p><strong>Monto:</strong> $${deposit.amount}</p>
                <p><strong>ID de depósito:</strong> ${deposit.id}</p>
              </div>
            </div>
          </body>
        </html>
      `;
            await this.emailService.send({
                to: shopEmail,
                subject: 'Depósito de Garantía Ejecutado',
                html: emailHtml,
            });
        }
        catch (error) {
            console.error('Error sending deposit executed notification:', error);
        }
    }
    /**
     * Obtiene una tienda por ID (helper)
     */
    async getShopById(shopId) {
        // Esta es una implementación simplificada
        // En producción, deberías inyectar ShopsService
        return null;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_preference_entity_1.NotificationPreference)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], NotificationService);
