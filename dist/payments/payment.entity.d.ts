import { User } from '../users/user.entity';
import { Raffle } from '../raffles/raffle.entity';
export declare const PaymentStatus: {
    readonly PENDING: "pending";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
    readonly REFUNDED: "refunded";
    readonly CANCELLED: "cancelled";
};
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];
export declare const PaymentMethod: {
    readonly STRIPE: "stripe";
    readonly MERCADO_PAGO: "mercado_pago";
    readonly PAYPAL: "paypal";
};
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];
export declare class Payment {
    id: string;
    userId: string;
    user: User;
    raffleId: string;
    raffle: Raffle;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod | null;
    ticketQuantity: number;
    externalTransactionId: string;
    failureReason: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date;
    failedAt: Date;
}
