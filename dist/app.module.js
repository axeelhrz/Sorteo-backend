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
const database_config_1 = require("./config/database.config");
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
            typeorm_1.TypeOrmModule.forRoot({
                ...database_config_1.databaseConfig,
                autoLoadEntities: true,
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
