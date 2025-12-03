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
exports.DepositsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const deposit_entity_1 = require("./deposit.entity");
const product_entity_1 = require("../products/product.entity");
const raffle_entity_1 = require("../raffles/raffle.entity");
const shop_entity_1 = require("../shops/shop.entity");
const notification_service_1 = require("../notifications/notification.service");
let DepositsService = class DepositsService {
    constructor(depositsRepository, productsRepository, rafflesRepository, shopsRepository, notificationService) {
        this.depositsRepository = depositsRepository;
        this.productsRepository = productsRepository;
        this.rafflesRepository = rafflesRepository;
        this.shopsRepository = shopsRepository;
        this.notificationService = notificationService;
    }
    /**
     * Calcula si un producto requiere depósito basado en sus dimensiones
     * Máximo permitido: 15x15x15 cm
     */
    async calculateDepositRequirement(product) {
        const MAX_DIMENSION = 15; // cm
        const exceedsDimensions = product.height > MAX_DIMENSION ||
            product.width > MAX_DIMENSION ||
            product.depth > MAX_DIMENSION;
        if (exceedsDimensions) {
            return {
                requiresDeposit: true,
                depositAmount: Number(product.value),
                reason: `Producto excede dimensiones máximas (15x15x15cm). Dimensiones actuales: ${product.height}x${product.width}x${product.depth}cm`,
            };
        }
        return {
            requiresDeposit: false,
            depositAmount: 0,
            reason: 'Producto dentro de dimensiones permitidas',
        };
    }
    /**
     * Valida las dimensiones de un producto
     */
    validateDimensions(height, width, depth) {
        const errors = [];
        const MAX_DIMENSION = 15;
        if (height <= 0)
            errors.push('Alto debe ser mayor a 0');
        if (width <= 0)
            errors.push('Ancho debe ser mayor a 0');
        if (depth <= 0)
            errors.push('Profundidad debe ser mayor a 0');
        if (height > MAX_DIMENSION)
            errors.push(`Alto no puede exceder ${MAX_DIMENSION}cm`);
        if (width > MAX_DIMENSION)
            errors.push(`Ancho no puede exceder ${MAX_DIMENSION}cm`);
        if (depth > MAX_DIMENSION)
            errors.push(`Profundidad no puede exceder ${MAX_DIMENSION}cm`);
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    /**
     * Crea un depósito de garantía para un sorteo
     */
    async createDepositForRaffle(raffle, product) {
        const depositRequirement = await this.calculateDepositRequirement(product);
        if (!depositRequirement.requiresDeposit) {
            return null;
        }
        const deposit = this.depositsRepository.create({
            shopId: raffle.shopId,
            raffleId: raffle.id,
            amount: depositRequirement.depositAmount,
            status: deposit_entity_1.DepositStatus.PENDING,
            notes: `Depósito de garantía para sorteo de ${product.name}. ${depositRequirement.reason}`,
        });
        const savedDeposit = await this.depositsRepository.save(deposit);
        // Cargar la tienda si no está presente
        let shop = raffle.shop;
        if (!shop) {
            shop = await this.shopsRepository.findOne({
                where: { id: raffle.shopId },
                relations: ['user'],
            });
        }
        // Notificar a la tienda
        if (shop) {
            await this.notificationService.notifyDepositCreated(shop, savedDeposit, product);
        }
        return savedDeposit;
    }
    /**
     * Obtiene todos los depósitos de una tienda
     */
    async getDepositsByShop(shopId) {
        return this.depositsRepository.find({
            where: { shopId },
            relations: ['raffle', 'raffle.product'],
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Obtiene un depósito por ID
     */
    async getDepositById(depositId) {
        const deposit = await this.depositsRepository.findOne({
            where: { id: depositId },
            relations: ['raffle', 'raffle.product', 'shop', 'shop.user'],
        });
        if (!deposit) {
            throw new common_1.NotFoundException('Depósito no encontrado');
        }
        return deposit;
    }
    /**
     * Obtiene depósitos por estado
     */
    async getDepositsByStatus(shopId, status) {
        return this.depositsRepository.find({
            where: { shopId, status },
            relations: ['raffle', 'raffle.product'],
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Libera un depósito (cuando el sorteo se completa exitosamente)
     */
    async releaseDeposit(depositId, notes) {
        const deposit = await this.getDepositById(depositId);
        if (deposit.status === deposit_entity_1.DepositStatus.RELEASED) {
            throw new common_1.BadRequestException('Este depósito ya ha sido liberado');
        }
        deposit.status = deposit_entity_1.DepositStatus.RELEASED;
        deposit.notes = notes || `Depósito liberado. Sorteo completado exitosamente.`;
        deposit.updatedAt = new Date();
        const updatedDeposit = await this.depositsRepository.save(deposit);
        // Notificar a la tienda
        await this.notificationService.notifyDepositReleased(deposit);
        return updatedDeposit;
    }
    /**
     * Retiene un depósito (cuando hay problemas con la entrega del premio)
     */
    async holdDeposit(depositId, reason) {
        const deposit = await this.getDepositById(depositId);
        if (deposit.status === deposit_entity_1.DepositStatus.HELD) {
            throw new common_1.BadRequestException('Este depósito ya está retenido');
        }
        deposit.status = deposit_entity_1.DepositStatus.HELD;
        deposit.notes = `Depósito retenido. Razón: ${reason}`;
        deposit.updatedAt = new Date();
        const updatedDeposit = await this.depositsRepository.save(deposit);
        // Notificar a la tienda
        await this.notificationService.notifyDepositHeld(deposit, reason);
        return updatedDeposit;
    }
    /**
     * Ejecuta un depósito (cuando se confirma la entrega del premio)
     */
    async executeDeposit(depositId) {
        const deposit = await this.getDepositById(depositId);
        if (deposit.status === deposit_entity_1.DepositStatus.EXECUTED) {
            throw new common_1.BadRequestException('Este depósito ya ha sido ejecutado');
        }
        deposit.status = deposit_entity_1.DepositStatus.EXECUTED;
        deposit.notes = `Depósito ejecutado. Premio entregado al ganador.`;
        deposit.updatedAt = new Date();
        const updatedDeposit = await this.depositsRepository.save(deposit);
        // Notificar a la tienda
        await this.notificationService.notifyDepositExecuted(deposit);
        return updatedDeposit;
    }
    /**
     * Obtiene estadísticas de depósitos por tienda
     */
    async getDepositStatistics(shopId) {
        const deposits = await this.getDepositsByShop(shopId);
        const stats = {
            totalDeposits: deposits.length,
            totalAmount: 0,
            byStatus: {
                pending: 0,
                held: 0,
                released: 0,
                executed: 0,
            },
            amountByStatus: {
                pending: 0,
                held: 0,
                released: 0,
                executed: 0,
            },
        };
        deposits.forEach((deposit) => {
            stats.totalAmount += Number(deposit.amount);
            stats.byStatus[deposit.status]++;
            stats.amountByStatus[deposit.status] += Number(deposit.amount);
        });
        return stats;
    }
    /**
     * Obtiene depósitos por rango de fechas
     */
    async getDepositsByDateRange(shopId, startDate, endDate) {
        return this.depositsRepository
            .createQueryBuilder('deposit')
            .where('deposit.shopId = :shopId', { shopId })
            .andWhere('deposit.createdAt >= :startDate', { startDate })
            .andWhere('deposit.createdAt <= :endDate', { endDate })
            .orderBy('deposit.createdAt', 'DESC')
            .leftJoinAndSelect('deposit.raffle', 'raffle')
            .leftJoinAndSelect('raffle.product', 'product')
            .getMany();
    }
};
exports.DepositsService = DepositsService;
exports.DepositsService = DepositsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(deposit_entity_1.Deposit)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __param(3, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], DepositsService);
