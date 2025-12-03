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
exports.ShopsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("./shop.entity");
const user_entity_1 = require("../users/user.entity");
const raffle_entity_1 = require("../raffles/raffle.entity");
const payment_entity_1 = require("../payments/payment.entity");
const raffle_ticket_entity_1 = require("../raffle-tickets/raffle-ticket.entity");
let ShopsService = class ShopsService {
    constructor(shopsRepository, usersRepository, rafflesRepository, paymentsRepository, ticketsRepository) {
        this.shopsRepository = shopsRepository;
        this.usersRepository = usersRepository;
        this.rafflesRepository = rafflesRepository;
        this.paymentsRepository = paymentsRepository;
        this.ticketsRepository = ticketsRepository;
    }
    async create(createShopDto) {
        // Validar que el usuario existe
        const user = await this.usersRepository.findOne({
            where: { id: createShopDto.userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('Usuario no encontrado');
        }
        // Validar que el usuario tiene rol 'shop'
        if (user.role !== 'shop') {
            throw new common_1.BadRequestException('El usuario debe tener rol shop para crear una tienda');
        }
        // Crear la tienda
        const shop = this.shopsRepository.create({
            ...createShopDto,
            status: shop_entity_1.ShopStatus.PENDING,
        });
        return this.shopsRepository.save(shop);
    }
    async findAll() {
        return this.shopsRepository.find({
            relations: ['user', 'products', 'raffles'],
        });
    }
    async findById(id) {
        const shop = await this.shopsRepository.findOne({
            where: { id },
            relations: ['user', 'products', 'raffles', 'deposits'],
        });
        if (!shop) {
            throw new common_1.NotFoundException('Tienda no encontrada');
        }
        return shop;
    }
    async findByUserId(userId) {
        return this.shopsRepository.find({
            where: { userId },
            relations: ['products', 'raffles'],
        });
    }
    /**
     * Obtiene o crea una tienda para un usuario con rol shop
     * Si no existe, la crea automáticamente usando el nombre del usuario
     */
    async getOrCreateShopForUser(userId, userName) {
        try {
            console.log(`🔍 getOrCreateShopForUser - userId: ${userId}, userName: ${userName}`);
            // Buscar si ya existe una tienda
            const existingShops = await this.findByUserId(userId);
            console.log(`📦 Tiendas existentes encontradas: ${existingShops?.length || 0}`);
            if (existingShops && existingShops.length > 0) {
                console.log(`✅ Retornando tienda existente: ${existingShops[0].id}`);
                return existingShops[0];
            }
            // Verificar que el usuario existe y tiene rol shop
            console.log(`👤 Buscando usuario: ${userId}`);
            const user = await this.usersRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                console.error(`❌ Usuario no encontrado: ${userId}`);
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
            console.log(`👤 Usuario encontrado: ${user.id} - ${user.name} - Rol: ${user.role}`);
            if (user.role !== 'shop') {
                console.error(`❌ Usuario no tiene rol shop: ${user.role}`);
                throw new common_1.BadRequestException('El usuario debe tener rol shop para tener una tienda');
            }
            // Crear la tienda automáticamente usando el nombre del usuario
            const shopName = userName?.trim() || user.name?.trim() || `Tienda de ${user.email}`;
            console.log(`🏪 Creando tienda con nombre: ${shopName}`);
            const shop = this.shopsRepository.create({
                userId: user.id,
                name: shopName,
                status: shop_entity_1.ShopStatus.PENDING,
            });
            const savedShop = await this.shopsRepository.save(shop);
            console.log(`✅ Tienda creada automáticamente: ${savedShop.id} - ${savedShop.name}`);
            return savedShop;
        }
        catch (error) {
            console.error('❌ Error en getOrCreateShopForUser:', error);
            throw error;
        }
    }
    async findVerified() {
        return this.shopsRepository.find({
            where: { status: shop_entity_1.ShopStatus.VERIFIED },
            relations: ['products', 'raffles'],
        });
    }
    async updateStatus(id, status) {
        const shop = await this.findById(id);
        // Validar transiciones de estado
        if (shop.status === shop_entity_1.ShopStatus.BLOCKED && status !== shop_entity_1.ShopStatus.BLOCKED) {
            throw new common_1.BadRequestException('No se puede cambiar el estado de una tienda bloqueada');
        }
        shop.status = status;
        return this.shopsRepository.save(shop);
    }
    async verify(id) {
        return this.updateStatus(id, shop_entity_1.ShopStatus.VERIFIED);
    }
    async block(id) {
        return this.updateStatus(id, shop_entity_1.ShopStatus.BLOCKED);
    }
    async update(id, updateData) {
        const shop = await this.findById(id);
        Object.assign(shop, updateData);
        return this.shopsRepository.save(shop);
    }
    async delete(id) {
        const shop = await this.findById(id);
        // Validar que no tenga sorteos activos
        const activeRaffles = shop.raffles?.filter((r) => r.status === 'active');
        if (activeRaffles && activeRaffles.length > 0) {
            throw new common_1.BadRequestException('No se puede eliminar una tienda con sorteos activos');
        }
        await this.shopsRepository.remove(shop);
    }
    /**
     * Obtiene estadísticas completas de una tienda
     */
    async getShopStatistics(shopId) {
        // Estadísticas de sorteos
        const raffles = await this.rafflesRepository.find({
            where: { shopId },
        });
        const raffleStats = {
            total: raffles.length,
            draft: raffles.filter((r) => r.status === raffle_entity_1.RaffleStatus.DRAFT).length,
            pendingApproval: raffles.filter((r) => r.status === raffle_entity_1.RaffleStatus.PENDING_APPROVAL).length,
            active: raffles.filter((r) => r.status === raffle_entity_1.RaffleStatus.ACTIVE).length,
            soldOut: raffles.filter((r) => r.status === raffle_entity_1.RaffleStatus.SOLD_OUT).length,
            finished: raffles.filter((r) => r.status === raffle_entity_1.RaffleStatus.FINISHED).length,
            cancelled: raffles.filter((r) => r.status === raffle_entity_1.RaffleStatus.CANCELLED).length,
        };
        // Estadísticas de tickets
        const allTickets = await this.ticketsRepository
            .createQueryBuilder('ticket')
            .leftJoin('ticket.raffle', 'raffle')
            .where('raffle.shopId = :shopId', { shopId })
            .getMany();
        const totalTicketsSold = allTickets.length;
        const totalTicketsAvailable = raffles.reduce((sum, r) => sum + r.totalTickets, 0);
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const ticketsThisMonth = allTickets.filter((t) => new Date(t.purchasedAt) >= thisMonth).length;
        // Estadísticas de ingresos
        const payments = await this.paymentsRepository
            .createQueryBuilder('payment')
            .leftJoin('payment.raffle', 'raffle')
            .where('raffle.shopId = :shopId', { shopId })
            .getMany();
        const completedPayments = payments.filter((p) => p.status === payment_entity_1.PaymentStatus.COMPLETED);
        const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const paymentsThisMonth = completedPayments.filter((p) => p.completedAt && new Date(p.completedAt) >= thisMonth);
        const revenueThisMonth = paymentsThisMonth.reduce((sum, p) => sum + Number(p.amount), 0);
        // Estadísticas de productos
        const shop = await this.findById(shopId);
        const products = shop.products || [];
        const activeProducts = products.filter((p) => p.status === 'active');
        const productsWithDeposit = products.filter((p) => p.requiresDeposit);
        // Tasa de conversión (tickets vendidos / tickets disponibles)
        const conversionRate = totalTicketsAvailable > 0 ? (totalTicketsSold / totalTicketsAvailable) * 100 : 0;
        return {
            raffles: raffleStats,
            tickets: {
                totalSold: totalTicketsSold,
                totalAvailable: totalTicketsAvailable,
                thisMonth: ticketsThisMonth,
            },
            revenue: {
                total: totalRevenue,
                thisMonth: revenueThisMonth,
                completedPayments: completedPayments.length,
            },
            products: {
                total: products.length,
                active: activeProducts.length,
                withDeposit: productsWithDeposit.length,
            },
            conversionRate: Math.round(conversionRate * 100) / 100,
        };
    }
};
exports.ShopsService = ShopsService;
exports.ShopsService = ShopsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(4, (0, typeorm_1.InjectRepository)(raffle_ticket_entity_1.RaffleTicket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ShopsService);
