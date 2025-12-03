import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface WebhookPayload {
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  timestamp: number;
  signature: string;
}

@Injectable()
export class PaymentWebhookService {
  private readonly webhookSecret: string;
  private processedWebhooks = new Set<string>(); // Para prevenir procesamiento duplicado

  constructor(configService: ConfigService) {
    this.webhookSecret = configService.get<string>('PAYMENT_GATEWAY_WEBHOOK_SECRET') || 'webhook-secret';
  }

  /**
   * Validar firma del webhook
   */
  validateWebhookSignature(payload: any, signature: string): boolean {
    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadString)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Procesar webhook de pago
   */
  async processPaymentWebhook(payload: WebhookPayload): Promise<{ processed: boolean; message: string }> {
    // Validar que el webhook no ha sido procesado antes (idempotencia)
    if (this.processedWebhooks.has(payload.transactionId)) {
      throw new ConflictException('This webhook has already been processed');
    }

    // Validar timestamp (no más de 5 minutos de antigüedad)
    const now = Date.now() / 1000;
    if (Math.abs(now - payload.timestamp) > 300) {
      throw new BadRequestException('Webhook timestamp is too old');
    }

    // Validar monto (debe ser positivo)
    if (payload.amount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    // Marcar como procesado
    this.processedWebhooks.add(payload.transactionId);

    // Limpiar webhooks procesados después de 1 hora
    setTimeout(() => {
      this.processedWebhooks.delete(payload.transactionId);
    }, 60 * 60 * 1000);

    return {
      processed: true,
      message: 'Webhook processed successfully',
    };
  }

  /**
   * Validar que la transacción no es duplicada
   */
  isDuplicateTransaction(transactionId: string): boolean {
    return this.processedWebhooks.has(transactionId);
  }

  /**
   * Generar firma para validar en cliente
   */
  generateSignature(payload: any): string {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadString)
      .digest('hex');
  }
}