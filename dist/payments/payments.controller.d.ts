import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    /**
     * PASO 5: Crear un pago pendiente
     * POST /payments
     * Body: { raffleId, amount, ticketQuantity }
     */
    createPayment(user: any, createPaymentDto: CreatePaymentDto): Promise<import("./payment.entity").Payment>;
    /**
     * PASO 8A.2: Confirmar pago completado
     * POST /payments/confirm
     * Body: { paymentId, externalTransactionId, paymentMethod }
     */
    confirmPayment(confirmPaymentDto: ConfirmPaymentDto): Promise<import("./payment.entity").Payment>;
    /**
     * PASO 8B.2: Registrar fallo de pago
     * POST /payments/:id/fail
     * Body: { failureReason }
     */
    failPayment(paymentId: string, failureReason: string): Promise<import("./payment.entity").Payment>;
    /**
     * Obtener un pago por ID
     * GET /payments/:id
     */
    getPaymentById(id: string): Promise<import("./payment.entity").Payment>;
    /**
     * Obtener pagos del usuario actual
     * GET /payments/user/me
     */
    getMyPayments(user: any): Promise<import("./payment.entity").Payment[]>;
    /**
     * Obtener pagos completados de un sorteo
     * GET /payments/raffle/:raffleId
     */
    getCompletedPaymentsByRaffleId(raffleId: string): Promise<import("./payment.entity").Payment[]>;
    /**
     * Obtener todos los pagos (admin)
     * GET /payments
     */
    getAllPayments(): Promise<import("./payment.entity").Payment[]>;
    /**
     * Reembolsar un pago
     * POST /payments/:id/refund
     */
    refundPayment(paymentId: string): Promise<import("./payment.entity").Payment>;
}
