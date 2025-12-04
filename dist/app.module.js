"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const shops_module_1 = require("./shops/shops.module");
const products_module_1 = require("./products/products.module");
const raffles_module_1 = require("./raffles/raffles.module");
const raffle_tickets_module_1 = require("./raffle-tickets/raffle-tickets.module");
const deposits_module_1 = require("./deposits/deposits.module");
const audit_module_1 = require("./audit/audit.module");
const admin_module_1 = require("./admin/admin.module");
const payments_module_1 = require("./payments/payments.module");
const complaints_module_1 = require("./complaints/complaints.module");
const notification_module_1 = require("./notifications/notification.module");
const uploads_module_1 = require("./uploads/uploads.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const isProduction = configService.get('NODE_ENV') === 'production';
                    const databaseUrl = configService.get('DATABASE_URL');
                    let config;
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
                        }
                        catch (error) {
                            console.error('❌ Error parsing DATABASE_URL:', error);
                            throw new Error('Invalid DATABASE_URL format');
                        }
                    }
                    else {
                        // Usar variables individuales (desarrollo local)
                        // Forzar IPv4 usando 127.0.0.1 en lugar de localhost para evitar problemas con IPv6
                        const host = configService.get('DATABASE_HOST') || '127.0.0.1';
                        const port = parseInt(configService.get('DATABASE_PORT') || '5432');
                        const username = configService.get('DATABASE_USER') || 'postgres';
                        const password = configService.get('DATABASE_PASSWORD') || 'postgres';
                        const database = configService.get('DATABASE_NAME') || 'tiketea_online';
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
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            shops_module_1.ShopsModule,
            products_module_1.ProductsModule,
            raffles_module_1.RafflesModule,
            raffle_tickets_module_1.RaffleTicketsModule,
            deposits_module_1.DepositsModule,
            audit_module_1.AuditModule,
            admin_module_1.AdminModule,
            payments_module_1.PaymentsModule,
            complaints_module_1.ComplaintsModule,
            notification_module_1.NotificationModule,
            uploads_module_1.UploadsModule,
        ],
    })
], AppModule);
