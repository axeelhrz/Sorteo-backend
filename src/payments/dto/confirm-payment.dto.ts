import { IsUUID, IsString, IsEnum } from 'class-validator';
import { PaymentMethod } from '../payment.entity';

export class ConfirmPaymentDto {
  @IsUUID()
  paymentId: string;

  @IsString()
  externalTransactionId: string;

  @IsEnum(['stripe', 'mercado_pago', 'paypal'])
  paymentMethod: PaymentMethod;
}