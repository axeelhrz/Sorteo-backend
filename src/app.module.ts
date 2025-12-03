import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ShopsModule } from './shops/shops.module';
import { ProductsModule } from './products/products.module';
import { RafflesModule } from './raffles/raffles.module';
import { RaffleTicketsModule } from './raffle-tickets/raffle-tickets.module';
import { DepositsModule } from './deposits/deposits.module';
import { AuditModule } from './audit/audit.module';
import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { NotificationModule } from './notifications/notification.module';
import { UploadsModule } from './uploads/uploads.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...databaseConfig,
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    ShopsModule,
    ProductsModule,
    RafflesModule,
    RaffleTicketsModule,
    DepositsModule,
    AuditModule,
    AdminModule,
    PaymentsModule,
    ComplaintsModule,
    NotificationModule,
    UploadsModule,
  ],
})
export class AppModule {}