import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './payment.entity';
import { Raffle } from '../raffles/raffle.entity';
import { RaffleTicketsModule } from '../raffle-tickets/raffle-tickets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Raffle]),
    RaffleTicketsModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}