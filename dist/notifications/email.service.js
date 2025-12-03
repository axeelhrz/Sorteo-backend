"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    constructor() {
        this.logger = new common_1.Logger(EmailService_1.name);
        // Configurar transporter de nodemailer
        // En producción, usar variables de entorno
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '1025'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: process.env.SMTP_USER
                ? {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                }
                : undefined,
        });
    }
    /**
     * Envía un email
     */
    async send(options) {
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@tiketeaonline.com',
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email enviado a ${options.to}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error enviando email a ${options.to}:`, error);
            return false;
        }
    }
    /**
     * Plantilla: Confirmación de compra de tickets
     */
    generatePurchaseConfirmationEmail(data) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3498db; }
            .ticket-list { list-style: none; padding: 0; }
            .ticket-list li { padding: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Confirmación de Compra</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${data.userName}</strong>,</p>
              <p>Tu compra de tickets ha sido confirmada exitosamente.</p>
              
              <div class="details">
                <h3>Detalles de tu compra</h3>
                <p><strong>Sorteo:</strong> ${data.raffleName}</p>
                <p><strong>Tienda:</strong> ${data.shopName}</p>
                <p><strong>Cantidad de tickets:</strong> ${data.ticketQuantity}</p>
                <p><strong>Números de tickets:</strong></p>
                <ul class="ticket-list">
                  ${data.ticketNumbers.map((num) => `<li>Ticket #${num}</li>`).join('')}
                </ul>
                <p><strong>Monto pagado:</strong> ${data.currency} ${data.amount.toFixed(2)}</p>
                <p><strong>Fecha:</strong> ${new Date(data.purchaseDate).toLocaleString('es-ES')}</p>
              </div>

              <p>Podés ver todos tus sorteos y tickets en tu panel:</p>
              <a href="${data.raffleUrl}" class="button">Ver mis sorteos</a>

              <p>Si tienes preguntas, no dudes en contactarnos.</p>
            </div>
            <div class="footer">
              <p>© 2024 TIKETEA ONLINE. Todos los derechos reservados.</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
    /**
     * Plantilla: Ganaste el sorteo
     */
    generateWinnerEmail(data) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #27ae60; }
            .highlight { font-size: 24px; font-weight: bold; color: #27ae60; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡FELICIDADES, GANASTE!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${data.winnerName}</strong>,</p>
              <p>¡Tenemos excelentes noticias! Has ganado el sorteo.</p>
              
              <div class="details">
                <h3>Información del sorteo ganado</h3>
                <p><strong>Sorteo:</strong> ${data.raffleName}</p>
                <p><strong>Tienda:</strong> ${data.shopName}</p>
                <p><strong>Tu ticket ganador:</strong> <span class="highlight">#${data.ticketNumber}</span></p>
              </div>

              <h3>Próximos pasos</h3>
              <p>La tienda se pondrá en contacto contigo para coordinar la entrega del premio. Puedes contactarla directamente:</p>
              <p>
                <strong>Email:</strong> ${data.shopEmail}<br>
                ${data.shopPhone ? `<strong>Teléfono:</strong> ${data.shopPhone}<br>` : ''}
              </p>

              <p>Ver detalles completos del sorteo:</p>
              <a href="${data.raffleUrl}" class="button">Ver sorteo</a>

              <p>¡Gracias por participar en nuestros sorteos!</p>
            </div>
            <div class="footer">
              <p>© 2024 TIKETEA ONLINE. Todos los derechos reservados.</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
    /**
     * Plantilla: Notificación a tienda sobre ganador
     */
    generateShopWinnerNotificationEmail(data) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3498db; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tu sorteo tiene un ganador</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${data.shopName}</strong>,</p>
              <p>El sorteo <strong>${data.raffleName}</strong> ha sido ejecutado y tiene un ganador.</p>
              
              <div class="details">
                <h3>Información del ganador</h3>
                <p><strong>Nombre:</strong> ${data.winnerName}</p>
                <p><strong>Email:</strong> ${data.winnerEmail}</p>
                <p><strong>Ticket ganador:</strong> #${data.ticketNumber}</p>
              </div>

              <h3>Próximos pasos</h3>
              <p>Debes contactar al ganador para coordinar la entrega del premio. Tienes acceso a su información en tu panel de control.</p>
              
              <a href="${data.shopDashboardUrl}" class="button">Ver en mi panel</a>

              <p>Recuerda mantener una buena comunicación con el ganador para asegurar una experiencia positiva.</p>
            </div>
            <div class="footer">
              <p>© 2024 TIKETEA ONLINE. Todos los derechos reservados.</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
    /**
     * Plantilla: Sorteo aprobado
     */
    generateRaffleApprovedEmail(data) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Tu sorteo fue aprobado</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${data.shopName}</strong>,</p>
              <p>¡Excelentes noticias! Tu sorteo <strong>${data.raffleName}</strong> ha sido aprobado y ya está activo en el marketplace.</p>
              
              <p>Los usuarios ya pueden ver tu sorteo y comprar tickets.</p>
              
              <a href="${data.marketplaceUrl}" class="button">Ver en el marketplace</a>

              <p>Gracias por usar nuestra plataforma.</p>
            </div>
            <div class="footer">
              <p>© 2024 TIKETEA ONLINE. Todos los derechos reservados.</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
    /**
     * Plantilla: Sorteo rechazado
     */
    generateRaffleRejectedEmail(data) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .reason { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tu sorteo fue rechazado</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${data.shopName}</strong>,</p>
              <p>Lamentablemente, tu sorteo <strong>${data.raffleName}</strong> no fue aprobado.</p>
              
              <div class="reason">
                <h3>Motivo del rechazo</h3>
                <p>${data.reason}</p>
              </div>

              <h3>¿Qué puedes hacer?</h3>
              <p>Puedes revisar los detalles de tu sorteo, hacer los cambios necesarios y reenviarlo para aprobación.</p>
              
              <a href="${data.dashboardUrl}" class="button">Ir a mi panel</a>

              <p>Si tienes preguntas sobre el rechazo, no dudes en contactarnos.</p>
            </div>
            <div class="footer">
              <p>© 2024 TIKETEA ONLINE. Todos los derechos reservados.</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
    /**
     * Plantilla: Tienda verificada
     */
    generateShopVerifiedEmail(data) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Tu tienda ha sido verificada</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${data.shopName}</strong>,</p>
              <p>¡Felicidades! Tu tienda ha sido verificada exitosamente.</p>
              
              <p>Ahora puedes crear sorteos que serán revisados por nuestro equipo de moderación. Tus sorteos aprobados aparecerán en el marketplace para que los usuarios puedan participar.</p>
              
              <a href="${data.dashboardUrl}" class="button">Ir a mi panel</a>

              <p>Gracias por ser parte de nuestra comunidad.</p>
            </div>
            <div class="footer">
              <p>© 2024 TIKETEA ONLINE. Todos los derechos reservados.</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
    /**
     * Plantilla: Tienda bloqueada
     */
    generateShopBlockedEmail(data) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
            .reason { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tu tienda ha sido bloqueada</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${data.shopName}</strong>,</p>
              <p>Tu tienda ha sido bloqueada temporalmente.</p>
              
              <div class="reason">
                <h3>Motivo</h3>
                <p>${data.reason}</p>
              </div>

              <h3>¿Qué significa esto?</h3>
              <p>No podrás crear nuevos sorteos hasta que se resuelva el problema. Si crees que esto es un error, puedes contactar a nuestro equipo de soporte.</p>
              
              <p><strong>Email de soporte:</strong> ${data.supportEmail}</p>

              <p>Estamos aquí para ayudarte a resolver esto.</p>
            </div>
            <div class="footer">
              <p>© 2024 TIKETEA ONLINE. Todos los derechos reservados.</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
    /**
     * Plantilla: Sorteo agotado (todos los tickets vendidos)
     */
    generateRaffleSoldOutEmail(data) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f39c12; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background-color: #f39c12; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .highlight { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f39c12; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Todos los tickets vendidos!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${data.shopName}</strong>,</p>
              <p>¡Excelentes noticias! Todos los tickets del sorteo <strong>${data.raffleName}</strong> han sido vendidos.</p>
              
              <div class="highlight">
                <h3>¿Qué sigue?</h3>
                <p>El sorteo se ejecutará automáticamente en breve para seleccionar al ganador. Te notificaremos cuando el ganador sea seleccionado.</p>
              </div>

              <p>Mientras tanto, puedes revisar los detalles de tu sorteo en tu panel de control.</p>
              
              ${data.dashboardUrl ? `<a href="${data.dashboardUrl}" class="button">Ver en mi panel</a>` : ''}

              <p>¡Gracias por usar nuestra plataforma!</p>
            </div>
            <div class="footer">
              <p>© 2024 TIKETEA ONLINE. Todos los derechos reservados.</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
