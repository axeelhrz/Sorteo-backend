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
var RafflesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RafflesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const raffle_entity_1 = require("./raffle.entity");
const shop_entity_1 = require("../shops/shop.entity");
const product_entity_1 = require("../products/product.entity");
const deposit_entity_1 = require("../deposits/deposit.entity");
const notification_event_service_1 = require("../notifications/notification-event.service");
let RafflesService = RafflesService_1 = class RafflesService {
    constructor(rafflesRepository, shopsRepository, productsRepository, depositsRepository, notificationEventService) {
        this.rafflesRepository = rafflesRepository;
        this.shopsRepository = shopsRepository;
        this.productsRepository = productsRepository;
        this.depositsRepository = depositsRepository;
        this.notificationEventService = notificationEventService;
        this.logger = new common_1.Logger(RafflesService_1.name);
    }
    async create(createRaffleDto) {
        // Validar que la tienda existe y está verificada
        const shop = await this.shopsRepository.findOne({
            where: { id: createRaffleDto.shopId },
        });
        if (!shop) {
            throw new common_1.BadRequestException('Tienda no encontrada');
        }
        if (shop.status === shop_entity_1.ShopStatus.BLOCKED) {
            throw new common_1.BadRequestException('La tienda está bloqueada y no puede crear sorteos');
        }
        // Validar que el producto existe
        const product = await this.productsRepository.findOne({
            where: { id: createRaffleDto.productId },
        });
        if (!product) {
            throw new common_1.BadRequestException('Producto no encontrado');
        }
        if (product.shopId !== createRaffleDto.shopId) {
            throw new common_1.BadRequestException('El producto no pertenece a esta tienda');
        }
        // Calcular total de tickets (valor del producto * 2) si no se proporciona
        let totalTickets = createRaffleDto.totalTickets;
        if (!totalTickets) {
            totalTickets = Math.floor(Number(product.value) * 2);
        }
        if (totalTickets < 1) {
            throw new common_1.BadRequestException('El sorteo debe tener al menos 1 ticket');
        }
        // Crear el sorteo
        const raffle = this.rafflesRepository.create({
            shopId: createRaffleDto.shopId,
            productId: createRaffleDto.productId,
            productValue: product.value,
            totalTickets,
            soldTickets: 0,
            status: raffle_entity_1.RaffleStatus.DRAFT,
            requiresDeposit: product.requiresDeposit,
            specialConditions: createRaffleDto.specialConditions,
        });
        return this.rafflesRepository.save(raffle);
    }
    async findAll() {
        return this.rafflesRepository.find({
            relations: ['shop', 'product', 'tickets', 'deposits'],
        });
    }
    async findById(id) {
        const raffle = await this.rafflesRepository.findOne({
            where: { id },
            relations: ['shop', 'shop.user', 'product', 'tickets', 'deposits'],
        });
        if (!raffle) {
            throw new common_1.NotFoundException('Sorteo no encontrado');
        }
        return raffle;
    }
    async findByShopId(shopId) {
        return this.rafflesRepository.find({
            where: { shopId },
            relations: ['product', 'tickets', 'deposits'],
        });
    }
    async findActive() {
        return this.rafflesRepository.find({
            where: { status: raffle_entity_1.RaffleStatus.ACTIVE },
            relations: ['shop', 'product', 'tickets'],
        });
    }
    async findPublicActive(filters) {
        const queryBuilder = this.rafflesRepository
            .createQueryBuilder('raffle')
            .leftJoinAndSelect('raffle.shop', 'shop')
            .leftJoinAndSelect('raffle.product', 'product')
            .leftJoinAndSelect('shop.user', 'user');
        // Filtrar por estado (por defecto solo activos y pausados, excluyendo draft, rejected)
        if (filters.status) {
            queryBuilder.andWhere('raffle.status = :status', { status: filters.status });
        }
        else {
            queryBuilder.andWhere('raffle.status IN (:...statuses)', {
                statuses: [raffle_entity_1.RaffleStatus.ACTIVE, raffle_entity_1.RaffleStatus.PAUSED, raffle_entity_1.RaffleStatus.SOLD_OUT],
            });
        }
        // Búsqueda por texto (nombre del producto)
        if (filters.search) {
            queryBuilder.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', { search: `%${filters.search}%` });
        }
        // Filtro por categoría
        if (filters.category) {
            queryBuilder.andWhere('product.category = :category', { category: filters.category });
        }
        // Filtro por tienda
        if (filters.shopId) {
            queryBuilder.andWhere('raffle.shopId = :shopId', { shopId: filters.shopId });
        }
        // Filtro por precio mínimo
        if (filters.minValue !== undefined) {
            queryBuilder.andWhere('raffle.productValue >= :minValue', { minValue: filters.minValue });
        }
        // Filtro por precio máximo
        if (filters.maxValue !== undefined) {
            queryBuilder.andWhere('raffle.productValue <= :maxValue', { maxValue: filters.maxValue });
        }
        // Ordenamiento
        switch (filters.sortBy) {
            case 'price-asc':
                queryBuilder.orderBy('raffle.productValue', 'ASC');
                break;
            case 'price-desc':
                queryBuilder.orderBy('raffle.productValue', 'DESC');
                break;
            case 'closest':
                queryBuilder.orderBy('raffle.soldTickets', 'DESC');
                break;
            case 'newest':
            default:
                queryBuilder.orderBy('raffle.createdAt', 'DESC');
                break;
        }
        // Paginación
        const page = filters.page || 1;
        const limit = filters.limit || 12;
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const [data, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async getCategories() {
        const raffles = await this.rafflesRepository
            .createQueryBuilder('raffle')
            .leftJoinAndSelect('raffle.product', 'product')
            .where('raffle.status IN (:...statuses)', {
            statuses: [raffle_entity_1.RaffleStatus.ACTIVE, raffle_entity_1.RaffleStatus.PAUSED, raffle_entity_1.RaffleStatus.SOLD_OUT],
        })
            .andWhere('product.category IS NOT NULL')
            .select('DISTINCT product.category', 'category')
            .getRawMany();
        return raffles.map((r) => r.category).filter((c) => c);
    }
    async getShopsWithActiveRaffles() {
        const shops = await this.shopsRepository
            .createQueryBuilder('shop')
            .innerJoin('shop.raffles', 'raffle')
            .where('raffle.status IN (:...statuses)', {
            statuses: [raffle_entity_1.RaffleStatus.ACTIVE, raffle_entity_1.RaffleStatus.PAUSED, raffle_entity_1.RaffleStatus.SOLD_OUT],
        })
            .andWhere('shop.status = :shopStatus', { shopStatus: shop_entity_1.ShopStatus.VERIFIED })
            .select(['shop.id', 'shop.name'])
            .distinct(true)
            .getMany();
        return shops.map((shop) => ({ id: shop.id, name: shop.name }));
    }
    async findByStatus(status) {
        return this.rafflesRepository.find({
            where: { status },
            relations: ['shop', 'product', 'tickets'],
        });
    }
    async submitForApproval(id) {
        const raffle = await this.findById(id);
        if (raffle.status !== raffle_entity_1.RaffleStatus.DRAFT) {
            throw new common_1.BadRequestException('Solo los sorteos en borrador pueden ser enviados a aprobación');
        }
        raffle.status = raffle_entity_1.RaffleStatus.PENDING_APPROVAL;
        return this.rafflesRepository.save(raffle);
    }
    async approve(id) {
        const raffle = await this.findById(id);
        if (raffle.status !== raffle_entity_1.RaffleStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Solo los sorteos pendientes de aprobación pueden ser aprobados');
        }
        // Validar que si requiere depósito, existe un depósito en estado 'held'
        if (raffle.requiresDeposit) {
            const deposit = await this.depositsRepository.findOne({
                where: {
                    raffleId: id,
                    status: deposit_entity_1.DepositStatus.HELD,
                },
            });
            if (!deposit) {
                throw new common_1.BadRequestException('Este sorteo requiere un depósito de garantía en estado "held" antes de ser activado');
            }
        }
        // Activar automáticamente el sorteo cuando se aprueba
        raffle.status = raffle_entity_1.RaffleStatus.ACTIVE;
        raffle.activatedAt = new Date();
        const savedRaffle = await this.rafflesRepository.save(raffle);
        // Notificar a la tienda que el sorteo fue aprobado y activado
        try {
            const shop = await this.shopsRepository.findOne({
                where: { id: raffle.shopId },
                relations: ['user'],
            });
            if (shop) {
                await this.notificationEventService.onRaffleApproved({
                    shopId: shop.id,
                    shopEmail: shop.publicEmail || shop.user?.email || '',
                    shopName: shop.name,
                    raffleName: raffle.product?.name || 'Sorteo',
                    marketplaceUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sorteos/${savedRaffle.id}`,
                });
            }
        }
        catch (error) {
            this.logger.error('Error notificando aprobación de sorteo:', error);
            // No lanzar excepción para no interrumpir el flujo de aprobación
        }
        return savedRaffle;
    }
    async reject(id) {
        const raffle = await this.findById(id);
        if (raffle.status !== raffle_entity_1.RaffleStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Solo los sorteos pendientes de aprobación pueden ser rechazados');
        }
        raffle.status = raffle_entity_1.RaffleStatus.REJECTED;
        return this.rafflesRepository.save(raffle);
    }
    async incrementSoldTickets(id, quantity) {
        const raffle = await this.findById(id);
        if (raffle.status !== raffle_entity_1.RaffleStatus.ACTIVE) {
            throw new common_1.BadRequestException('Solo se pueden vender tickets de sorteos activos');
        }
        const newSoldTickets = raffle.soldTickets + quantity;
        if (newSoldTickets > raffle.totalTickets) {
            throw new common_1.BadRequestException(`No se pueden vender más de ${raffle.totalTickets - raffle.soldTickets} tickets`);
        }
        raffle.soldTickets = newSoldTickets;
        // Si se vendieron todos los tickets, cambiar estado a sold_out
        if (raffle.soldTickets === raffle.totalTickets) {
            raffle.status = raffle_entity_1.RaffleStatus.SOLD_OUT;
        }
        return this.rafflesRepository.save(raffle);
    }
    async executeRaffle(id, winnerTicketId) {
        const raffle = await this.findById(id);
        if (raffle.status !== raffle_entity_1.RaffleStatus.SOLD_OUT && raffle.status !== raffle_entity_1.RaffleStatus.ACTIVE) {
            throw new common_1.BadRequestException('El sorteo debe estar vendido o activo para ejecutarse');
        }
        raffle.winnerTicketId = winnerTicketId;
        raffle.status = raffle_entity_1.RaffleStatus.FINISHED;
        raffle.raffleExecutedAt = new Date();
        return this.rafflesRepository.save(raffle);
    }
    async cancel(id) {
        const raffle = await this.findById(id);
        if (raffle.status === raffle_entity_1.RaffleStatus.FINISHED) {
            throw new common_1.BadRequestException('No se puede cancelar un sorteo ya finalizado');
        }
        raffle.status = raffle_entity_1.RaffleStatus.CANCELLED;
        return this.rafflesRepository.save(raffle);
    }
    async update(id, updateData) {
        const raffle = await this.findById(id);
        if (raffle.status !== raffle_entity_1.RaffleStatus.DRAFT) {
            throw new common_1.BadRequestException('Solo se pueden editar sorteos en estado borrador');
        }
        Object.assign(raffle, updateData);
        return this.rafflesRepository.save(raffle);
    }
    async delete(id) {
        const raffle = await this.findById(id);
        if (raffle.soldTickets > 0) {
            throw new common_1.BadRequestException('No se puede eliminar un sorteo que tiene tickets vendidos');
        }
        await this.rafflesRepository.remove(raffle);
    }
    /**
     * Pausar un sorteo activo
     */
    async pause(id) {
        const raffle = await this.findById(id);
        if (raffle.status !== raffle_entity_1.RaffleStatus.ACTIVE) {
            throw new common_1.BadRequestException('Solo se pueden pausar sorteos activos');
        }
        if (raffle.soldTickets > 0) {
            throw new common_1.BadRequestException('No se puede pausar un sorteo que ya tiene tickets vendidos');
        }
        raffle.status = raffle_entity_1.RaffleStatus.PAUSED;
        return this.rafflesRepository.save(raffle);
    }
    /**
     * Reanudar un sorteo pausado
     */
    async resume(id) {
        const raffle = await this.findById(id);
        if (raffle.status !== raffle_entity_1.RaffleStatus.PAUSED) {
            throw new common_1.BadRequestException('Solo se pueden reanudar sorteos pausados');
        }
        raffle.status = raffle_entity_1.RaffleStatus.ACTIVE;
        return this.rafflesRepository.save(raffle);
    }
};
exports.RafflesService = RafflesService;
exports.RafflesService = RafflesService = RafflesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(deposit_entity_1.Deposit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_event_service_1.NotificationEventService])
], RafflesService);
