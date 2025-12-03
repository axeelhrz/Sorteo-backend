import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './shop.entity';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { User } from '../users/user.entity';
import { Raffle } from '../raffles/raffle.entity';
import { Payment } from '../payments/payment.entity';
import { RaffleTicket } from '../raffle-tickets/raffle-ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, User, Raffle, Payment, RaffleTicket])],
  providers: [ShopsService],
  controllers: [ShopsController],
  exports: [ShopsService],
})
export class ShopsModule {}