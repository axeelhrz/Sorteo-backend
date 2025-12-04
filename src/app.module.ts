import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        let config: TypeOrmModuleOptions;
        
        if (databaseUrl) {
          // Usar DATABASE_URL si está disponible (formato de Railway)
          try {
            const url = new URL(databaseUrl);
            // Si el hostname es 'localhost', usar 127.0.0.1 para forzar IPv4
            const dbHost = url.hostname === 'localhost' ? '127.0.0.1' : url.hostname;
            
            config = {
              type: 'postgres',
              host: dbHost,
              port: parseInt(url.port || '5432'),
              username: decodeURIComponent(url.username),
              password: decodeURIComponent(url.password),
              database: url.pathname.slice(1),
              autoLoadEntities: true,
              migrations: [],
              migrationsRun: false,
              synchronize: false,
              logging: !isProduction,
              ssl: isProduction ? { rejectUnauthorized: false } : false,
              extra: {
                max: 10, // máximo de conexiones en el pool
                connectionTimeoutMillis: 10000,
                idleTimeoutMillis: 30000,
              },
            };
            console.log(`✅ Database config from DATABASE_URL:`);
            console.log(`   Host: ${url.hostname}`);
            console.log(`   Port: ${url.port || '5432'}`);
            console.log(`   Database: ${url.pathname.slice(1)}`);
            console.log(`   User: ${url.username}`);
            console.log(`   SSL: ${isProduction ? 'enabled' : 'disabled'}`);
          } catch (error) {
            console.error('❌ Error parsing DATABASE_URL:', error);
            throw new Error('Invalid DATABASE_URL format');
          }
        } else {
          // Usar variables individuales (desarrollo local)
          // Forzar IPv4 usando 127.0.0.1 en lugar de localhost para evitar problemas con IPv6
          const host = configService.get<string>('DATABASE_HOST') || '127.0.0.1';
          const port = parseInt(configService.get<string>('DATABASE_PORT') || '5432');
          const username = configService.get<string>('DATABASE_USER') || 'postgres';
          const password = configService.get<string>('DATABASE_PASSWORD') || 'postgres';
          const database = configService.get<string>('DATABASE_NAME') || 'tiketea_online';
          
          config = {
            type: 'postgres',
            host,
            port,
            username,
            password,
            database,
            autoLoadEntities: true,
            migrations: [],
            migrationsRun: false,
            synchronize: false,
            logging: !isProduction,
            extra: {
              max: 10, // máximo de conexiones en el pool
              connectionTimeoutMillis: 10000,
              idleTimeoutMillis: 30000,
            },
          };
          
          console.log(`⚠️  Using individual database variables (DATABASE_URL not found):`);
          console.log(`   Host: ${host}`);
          console.log(`   Port: ${port}`);
          console.log(`   Database: ${database}`);
          console.log(`   User: ${username}`);
          console.log(`   ⚠️  Make sure PostgreSQL is running locally or configure DATABASE_URL for Railway`);
        }
        
        return config;
      },
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