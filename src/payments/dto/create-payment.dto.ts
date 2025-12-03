import { IsUUID, IsNumber, IsInt, Min, IsPositive } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  raffleId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsInt()
  @Min(1)
  ticketQuantity: number;
}