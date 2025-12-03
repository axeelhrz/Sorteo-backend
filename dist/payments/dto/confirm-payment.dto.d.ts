import { PaymentMethod } from '../payment.entity';
export declare class ConfirmPaymentDto {
    paymentId: string;
    externalTransactionId: string;
    paymentMethod: PaymentMethod;
}
