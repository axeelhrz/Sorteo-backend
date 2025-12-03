"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const raffle_entity_1 = require("../raffles/raffle.entity");
const shop_entity_1 = require("../shops/shop.entity");
const user_entity_1 = require("../users/user.entity");
const payment_entity_1 = require("../payments/payment.entity");
const audit_service_1 = require("../audit/audit.service");
const audit_entity_1 = require("../audit/audit.entity");
const raffle_execution_service_1 = require("../raffles/raffle-execution.service");
let AdminService = class AdminService {
    constructor(rafflesRepository, shopsRepository, usersRepository, paymentsRepository, auditService, raffleExecutionService) {
        this.rafflesRepository = rafflesRepository;
        this.shopsRepository = shopsRepository;
        this.usersRepository = usersRepository;
        this.paymentsRepository = paymentsRepository;
        this.auditService = auditService;
        this.raffleExecutionService = raffleExecutionService;
    }
    // ============ DASHBOARD ============
    async getDashboardStats() {
        const totalUsers = await this.usersRepository.count();
        const totalShops = await this.shopsRepository.count();
        const pendingShops = await this.shopsRepository.count({
            where: { status: shop_entity_1.ShopStatus.PENDING },
        });
        const verifiedShops = await this.shopsRepository.count({
            where: { status: shop_entity_1.ShopStatus.VERIFIED },
        });
        const blockedShops = await this.shopsRepository.count({
            where: { status: shop_entity_1.ShopStatus.BLOCKED },
        });
        const pendingRaffles = await this.rafflesRepository.count({
            where: { status: raffle_entity_1.RaffleStatus.PENDING_APPROVAL },
        });
        const activeRaffles = await this.rafflesRepository.count({
            where: { status: raffle_entity_1.RaffleStatus.ACTIVE },
        });
        const finishedRaffles = await this.rafflesRepository.count({
            where: { status: raffle_entity_1.RaffleStatus.FINISHED },
        });
        const cancelledRaffles = await this.rafflesRepository.count({
            where: { status: raffle_entity_1.RaffleStatus.CANCELLED },
        });
        const rejectedRaffles = await this.rafflesRepository.count({
            where: { status: raffle_entity_1.RaffleStatus.REJECTED },
        });
        // Calcular total de tickets vendidos
        const raffles = await this.rafflesRepository.find();
        const totalTicketsSold = raffles.reduce((sum, r) => sum + r.soldTickets, 0);
        // Estadísticas de pagos y transacciones
        const totalPayments = await this.paymentsRepository.count();
        const completedPayments = await this.paymentsRepository.count({
            where: { status: payment_entity_1.PaymentStatus.COMPLETED },
        });
        const pendingPayments = await this.paymentsRepository.count({
            where: { status: payment_entity_1.PaymentStatus.PENDING },
        });
        const failedPayments = await this.paymentsRepository.count({
            where: { status: payment_entity_1.PaymentStatus.FAILED },
        });
        const refundedPayments = await this.paymentsRepository.count({
            where: { status: payment_entity_1.PaymentStatus.REFUNDED },
        });
        // Calcular monto total de pagos completados
        const completedPaymentsList = await this.paymentsRepository.find({
            where: { status: payment_entity_1.PaymentStatus.COMPLETED },
        });
        const totalRevenue = completedPaymentsList.reduce((sum, p) => sum + Number(p.amount), 0);
        return {
            users: {
                total: totalUsers,
            },
            shops: {
                total: totalShops,
                pending: pendingShops,
                verified: verifiedShops,
                blocked: blockedShops,
            },
            raffles: {
                pending: pendingRaffles,
                active: activeRaffles,
                finished: finishedRaffles,
                cancelled: cancelledRaffles,
                rejected: rejectedRaffles,
            },
            tickets: {
                totalSold: totalTicketsSold,
            },
            payments: {
                total: totalPayments,
                completed: completedPayments,
                pending: pendingPayments,
                failed: failedPayments,
                refunded: refundedPayments,
                totalRevenue,
            },
        };
    }
    // ============ RAFFLES ============
    async getPendingRaffles(limit = 50, offset = 0) {
        const [raffles, total] = await this.rafflesRepository.findAndCount({
            where: { status: raffle_entity_1.RaffleStatus.PENDING_APPROVAL },
            relations: ['shop', 'product'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
        return { data: raffles, total };
    }
    async getActiveRaffles(limit = 50, offset = 0, filters) {
        const query = this.rafflesRepository.createQueryBuilder('raffle')
            .where('raffle.status = :status', { status: raffle_entity_1.RaffleStatus.ACTIVE })
            .leftJoinAndSelect('raffle.shop', 'shop')
            .leftJoinAndSelect('raffle.product', 'product')
            .orderBy('raffle.createdAt', 'DESC');
        if (filters?.shopId) {
            query.andWhere('raffle.shopId = :shopId', { shopId: filters.shopId });
        }
        query.take(limit).skip(offset);
        return query.getManyAndCount();
    }
    async getFinishedRaffles(limit = 50, offset = 0, filters) {
        const query = this.rafflesRepository.createQueryBuilder('raffle')
            .where('raffle.status IN (:...statuses)', {
            statuses: [raffle_entity_1.RaffleStatus.FINISHED, raffle_entity_1.RaffleStatus.SOLD_OUT],
        })
            .leftJoinAndSelect('raffle.shop', 'shop')
            .leftJoinAndSelect('raffle.product', 'product')
            .leftJoinAndSelect('raffle.tickets', 'tickets')
            .orderBy('raffle.raffleExecutedAt', 'DESC');
        if (filters?.shopId) {
            query.andWhere('raffle.shopId = :shopId', { shopId: filters.shopId });
        }
        query.take(limit).skip(offset);
        return query.getManyAndCount();
    }
    async getRaffleDetail(raffleId) {
        const raffle = await this.rafflesRepository.findOne({
            where: { id: raffleId },
            relations: ['shop', 'product', 'tickets', 'deposits'],
        });
        if (!raffle) {
            throw new common_1.NotFoundException('Sorteo no encontrado');
        }
        return raffle;
    }
    async approveRaffle(raffleId, adminId) {
        const raffle = await this.getRaffleDetail(raffleId);
        if (raffle.status !== raffle_entity_1.RaffleStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Solo los sorteos pendientes pueden ser aprobados');
        }
        const previousStatus = raffle.status;
        raffle.status = raffle_entity_1.RaffleStatus.ACTIVE;
        raffle.activatedAt = new Date();
        const updated = await this.rafflesRepository.save(raffle);
        // Registrar en auditoría
        await this.auditService.log(adminId, audit_entity_1.AuditAction.RAFFLE_APPROVED, 'raffle', raffleId, {
            previousStatus,
            newStatus: raffle_entity_1.RaffleStatus.ACTIVE,
        });
        return updated;
    }
    async rejectRaffle(raffleId, adminId, reason) {
        const raffle = await this.getRaffleDetail(raffleId);
        if (raffle.status !== raffle_entity_1.RaffleStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Solo los sorteos pendientes pueden ser rechazados');
        }
        const previousStatus = raffle.status;
        raffle.status = raffle_entity_1.RaffleStatus.REJECTED;
        const updated = await this.rafflesRepository.save(raffle);
        // Registrar en auditoría
        await this.auditService.log(adminId, audit_entity_1.AuditAction.RAFFLE_REJECTED, 'raffle', raffleId, {
            previousStatus,
            newStatus: raffle_entity_1.RaffleStatus.REJECTED,
            reason,
        });
        return updated;
    }
    async cancelRaffle(raffleId, adminId, reason) {
        const raffle = await this.getRaffleDetail(raffleId);
        if (raffle.status === raffle_entity_1.RaffleStatus.FINISHED) {
            throw new common_1.BadRequestException('No se puede cancelar un sorteo finalizado');
        }
        const previousStatus = raffle.status;
        raffle.status = raffle_entity_1.RaffleStatus.CANCELLED;
        const updated = await this.rafflesRepository.save(raffle);
        // Registrar en auditoría
        await this.auditService.log(adminId, audit_entity_1.AuditAction.RAFFLE_CANCELLED, 'raffle', raffleId, {
            previousStatus,
            newStatus: raffle_entity_1.RaffleStatus.CANCELLED,
            reason,
        });
        return updated;
    }
    async executeRaffle(raffleId, adminId) {
        return this.raffleExecutionService.executeRaffleSecurely(raffleId, adminId);
    }
    // ============ SHOPS ============
    async getAllShops(limit = 50, offset = 0, filters) {
        const query = this.shopsRepository.createQueryBuilder('shop')
            .leftJoinAndSelect('shop.user', 'user')
            .leftJoinAndSelect('shop.raffles', 'raffles')
            .orderBy('shop.createdAt', 'DESC');
        if (filters?.status) {
            query.andWhere('shop.status = :status', { status: filters.status });
        }
        query.take(limit).skip(offset);
        return query.getManyAndCount();
    }
    async getShopDetail(shopId) {
        const shop = await this.shopsRepository.findOne({
            where: { id: shopId },
            relations: ['user', 'raffles', 'products', 'deposits'],
        });
        if (!shop) {
            throw new common_1.NotFoundException('Tienda no encontrada');
        }
        // Calcular estadísticas
        const stats = {
            totalRaffles: shop.raffles?.length || 0,
            activeRaffles: shop.raffles?.filter((r) => r.status === raffle_entity_1.RaffleStatus.ACTIVE).length || 0,
            finishedRaffles: shop.raffles?.filter((r) => r.status === raffle_entity_1.RaffleStatus.FINISHED).length || 0,
            cancelledRaffles: shop.raffles?.filter((r) => r.status === raffle_entity_1.RaffleStatus.CANCELLED).length || 0,
        };
        return { ...shop, stats };
    }
    async changeShopStatus(shopId, newStatus, adminId, reason) {
        const shop = await this.getShopDetail(shopId);
        if (shop.status === newStatus) {
            throw new common_1.BadRequestException('El estado es igual al actual');
        }
        const previousStatus = shop.status;
        shop.status = newStatus;
        const updated = await this.shopsRepository.save(shop);
        // Registrar en auditoría
        const action = newStatus === shop_entity_1.ShopStatus.VERIFIED
            ? audit_entity_1.AuditAction.SHOP_VERIFIED
            : newStatus === shop_entity_1.ShopStatus.BLOCKED
                ? audit_entity_1.AuditAction.SHOP_BLOCKED
                : audit_entity_1.AuditAction.SHOP_STATUS_CHANGED;
        await this.auditService.log(adminId, action, 'shop', shopId, {
            previousStatus,
            newStatus,
            reason,
        });
        return updated;
    }
    // ============ USERS ============
    async getAllUsers(limit = 50, offset = 0, filters) {
        const query = this.usersRepository.createQueryBuilder('user')
            .orderBy('user.createdAt', 'DESC');
        if (filters?.role) {
            query.andWhere('user.role = :role', { role: filters.role });
        }
        query.take(limit).skip(offset);
        return query.getManyAndCount();
    }
    async getUserDetail(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        // Obtener información adicional según el rol
        let additionalInfo = {};
        if (user.role === user_entity_1.UserRole.SHOP) {
            const shops = await this.shopsRepository.find({
                where: { userId },
                relations: ['raffles'],
            });
            additionalInfo = { shops };
        }
        return { ...user, additionalInfo };
    }
    // ============ PAYMENTS ============
    async getAllPayments(limit = 50, offset = 0, filters) {
        const query = this.paymentsRepository.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.user', 'user')
            .leftJoinAndSelect('payment.raffle', 'raffle')
            .leftJoinAndSelect('raffle.product', 'product')
            .leftJoinAndSelect('raffle.shop', 'shop')
            .orderBy('payment.createdAt', 'DESC');
        if (filters?.status) {
            query.andWhere('payment.status = :status', { status: filters.status });
        }
        if (filters?.userId) {
            query.andWhere('payment.userId = :userId', { userId: filters.userId });
        }
        if (filters?.raffleId) {
            query.andWhere('payment.raffleId = :raffleId', { raffleId: filters.raffleId });
        }
        query.take(limit).skip(offset);
        return query.getManyAndCount();
    }
    async getPaymentDetail(paymentId) {
        const payment = await this.paymentsRepository.findOne({
            where: { id: paymentId },
            relations: ['user', 'raffle', 'raffle.product', 'raffle.shop'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pago no encontrado');
        }
        return payment;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService,
        raffle_execution_service_1.RaffleExecutionService])
], AdminService);
