import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from './raffle.entity';
import { RafflesService } from './raffles.service';
import { RafflesController } from './raffles.controller';
import { RaffleExecutionService } from './raffle-execution.service';
import { Shop } from '../shops/shop.entity';
import { Product } from '../products/product.entity';
import { Deposit } from '../deposits/deposit.entity';
import { RaffleTicket } from '../raffle-tickets/raffle-ticket.entity';
import { AuditModule } from '../audit/audit.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Raffle, Shop, Product, Deposit, RaffleTicket]),
    AuditModule,
    NotificationModule,
  ],
  providers: [RafflesService, RaffleExecutionService],
  controllers: [RafflesController],
  exports: [RafflesService, RaffleExecutionService],
})
export class RafflesModule {}