import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposit } from './deposit.entity';
import { DepositsService } from './deposits.service';
import { DepositsController } from './deposits.controller';
import { Shop } from '../shops/shop.entity';
import { Raffle } from '../raffles/raffle.entity';
import { Product } from '../products/product.entity';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit, Shop, Raffle, Product]),
    NotificationModule,
  ],
  providers: [DepositsService],
  controllers: [DepositsController],
  exports: [DepositsService],
})
export class DepositsModule {}