import { ConfigService } from '@nestjs/config';
interface WebhookPayload {
    transactionId: string;
    status: 'success' | 'failed' | 'pending';
    amount: number;
    currency: string;
    timestamp: number;
    signature: string;
}
export declare class PaymentWebhookService {
    private readonly webhookSecret;
    private processedWebhooks;
    constructor(configService: ConfigService);
    /**
     * Validar firma del webhook
     */
    validateWebhookSignature(payload: any, signature: string): boolean;
    /**
     * Procesar webhook de pago
     */
    processPaymentWebhook(payload: WebhookPayload): Promise<{
        processed: boolean;
        message: string;
    }>;
    /**
     * Validar que la transacción no es duplicada
     */
    isDuplicateTransaction(transactionId: string): boolean;
    /**
     * Generar firma para validar en cliente
     */
    generateSignature(payload: any): string;
}
export {};
