import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaffleTicket } from './raffle-ticket.entity';
import { RaffleTicketsService } from './raffle-tickets.service';
import { RaffleTicketsController } from './raffle-tickets.controller';
import { Raffle } from '../raffles/raffle.entity';
import { User } from '../users/user.entity';
import { RafflesModule } from '../raffles/raffles.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RaffleTicket, Raffle, User]),
    forwardRef(() => RafflesModule),
    NotificationModule,
  ],
  providers: [RaffleTicketsService],
  controllers: [RaffleTicketsController],
  exports: [RaffleTicketsService],
})
export class RaffleTicketsModule {}