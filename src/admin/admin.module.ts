import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Raffle } from '../raffles/raffle.entity';
import { Shop } from '../shops/shop.entity';
import { User } from '../users/user.entity';
import { Payment } from '../payments/payment.entity';
import { AuditModule } from '../audit/audit.module';
import { RafflesModule } from '../raffles/raffles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Raffle, Shop, User, Payment]),
    AuditModule,
    RafflesModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}