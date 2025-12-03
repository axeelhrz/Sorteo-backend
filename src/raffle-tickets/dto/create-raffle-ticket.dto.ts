import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateRaffleTicketDto {
  @IsUUID()
  raffleId: string;

  @IsUUID()
  userId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsUUID()
  paymentId: string;
}