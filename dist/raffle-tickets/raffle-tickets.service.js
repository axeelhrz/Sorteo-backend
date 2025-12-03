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
var RaffleTicketsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaffleTicketsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const raffle_ticket_entity_1 = require("./raffle-ticket.entity");
const raffle_entity_1 = require("../raffles/raffle.entity");
const user_entity_1 = require("../users/user.entity");
const raffle_execution_service_1 = require("../raffles/raffle-execution.service");
const notification_event_service_1 = require("../notifications/notification-event.service");
let RaffleTicketsService = RaffleTicketsService_1 = class RaffleTicketsService {
    constructor(ticketsRepository, rafflesRepository, usersRepository, raffleExecutionService, notificationEventService) {
        this.ticketsRepository = ticketsRepository;
        this.rafflesRepository = rafflesRepository;
        this.usersRepository = usersRepository;
        this.raffleExecutionService = raffleExecutionService;
        this.notificationEventService = notificationEventService;
        this.logger = new common_1.Logger(RaffleTicketsService_1.name);
    }
    async create(createRaffleTicketDto) {
        // Validar que el sorteo existe con relaciones
        const raffle = await this.rafflesRepository.findOne({
            where: { id: createRaffleTicketDto.raffleId },
            relations: ['shop', 'shop.user', 'product'],
        });
        if (!raffle) {
            throw new common_1.BadRequestException('Sorteo no encontrado');
        }
        // Validar que el usuario existe
        const user = await this.usersRepository.findOne({
            where: { id: createRaffleTicketDto.userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('Usuario no encontrado');
        }
        // Validar cantidad de tickets
        if (createRaffleTicketDto.quantity < 1) {
            throw new common_1.BadRequestException('La cantidad de tickets debe ser mayor a 0');
        }
        // Validar que hay tickets disponibles
        const availableTickets = raffle.totalTickets - raffle.soldTickets;
        if (createRaffleTicketDto.quantity > availableTickets) {
            throw new common_1.BadRequestException(`Solo hay ${availableTickets} tickets disponibles`);
        }
        // Obtener el próximo número de ticket
        const lastTicket = await this.ticketsRepository.findOne({
            where: { raffleId: createRaffleTicketDto.raffleId },
            order: { number: 'DESC' },
        });
        let nextNumber = 1;
        if (lastTicket) {
            nextNumber = lastTicket.number + 1;
        }
        // Crear los tickets
        const tickets = [];
        for (let i = 0; i < createRaffleTicketDto.quantity; i++) {
            const ticket = this.ticketsRepository.create({
                raffleId: createRaffleTicketDto.raffleId,
                userId: createRaffleTicketDto.userId,
                number: nextNumber + i,
                status: raffle_ticket_entity_1.RaffleTicketStatus.SOLD,
                paymentId: createRaffleTicketDto.paymentId,
            });
            tickets.push(ticket);
        }
        // Guardar todos los tickets
        const savedTickets = await this.ticketsRepository.save(tickets);
        // Actualizar el contador de tickets vendidos en el sorteo
        raffle.soldTickets += createRaffleTicketDto.quantity;
        const wasSoldOut = raffle.soldTickets === raffle.totalTickets;
        if (wasSoldOut) {
            raffle.status = raffle_entity_1.RaffleStatus.SOLD_OUT;
        }
        const updatedRaffle = await this.rafflesRepository.save(raffle);
        // Si se vendieron todos los tickets, ejecutar automáticamente el sorteo
        if (wasSoldOut) {
            this.logger.log(`Todos los tickets vendidos para sorteo ${raffle.id}. Ejecutando automáticamente...`);
            // Notificar que el sorteo se agotó (antes de ejecutarlo)
            try {
                // Recargar el sorteo con relaciones para obtener información completa
                const raffleWithRelations = await this.rafflesRepository.findOne({
                    where: { id: raffle.id },
                    relations: ['shop', 'shop.user', 'product'],
                });
                if (raffleWithRelations) {
                    await this.notificationEventService.onRaffleSoldOut({
                        raffleId: raffleWithRelations.id,
                        raffleName: raffleWithRelations.product?.name || 'Sorteo',
                        shopId: raffleWithRelations.shopId,
                        shopEmail: raffleWithRelations.shop?.publicEmail || raffleWithRelations.shop?.user?.email || '',
                        shopName: raffleWithRelations.shop?.name || 'Tienda',
                    });
                }
            }
            catch (error) {
                this.logger.error('Error notificando que el sorteo se agotó:', error);
            }
            // Ejecutar automáticamente el sorteo
            try {
                const executedRaffle = await this.raffleExecutionService.autoExecuteWhenSoldOut(raffle.id);
                if (executedRaffle && executedRaffle.winnerTicketId) {
                    this.logger.log(`Sorteo ${raffle.id} ejecutado automáticamente. Ganador: ${executedRaffle.winnerTicketId}`);
                    // Obtener información del ganador para notificaciones
                    const winnerTicket = await this.ticketsRepository.findOne({
                        where: { id: executedRaffle.winnerTicketId },
                        relations: ['user', 'raffle', 'raffle.product', 'raffle.shop', 'raffle.shop.user'],
                    });
                    if (winnerTicket && winnerTicket.user && winnerTicket.raffle) {
                        // Notificar al ganador
                        try {
                            await this.notificationEventService.onRaffleExecutedWinner({
                                winnerId: winnerTicket.user.id,
                                winnerEmail: winnerTicket.user.email,
                                winnerName: winnerTicket.user.name,
                                raffleName: winnerTicket.raffle.product?.name || 'Sorteo',
                                shopName: winnerTicket.raffle.shop?.name || 'Tienda',
                                shopEmail: winnerTicket.raffle.shop?.publicEmail || winnerTicket.raffle.shop?.user?.email || '',
                                shopPhone: winnerTicket.raffle.shop?.phone || undefined,
                                ticketNumber: winnerTicket.number,
                                raffleUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sorteos/${winnerTicket.raffle.id}`,
                            });
                        }
                        catch (error) {
                            this.logger.error('Error notificando al ganador:', error);
                        }
                        // Notificar a la tienda
                        try {
                            await this.notificationEventService.onRaffleExecutedShop({
                                shopId: winnerTicket.raffle.shopId,
                                shopEmail: winnerTicket.raffle.shop?.publicEmail || winnerTicket.raffle.shop?.user?.email || '',
                                shopName: winnerTicket.raffle.shop?.name || 'Tienda',
                                raffleName: winnerTicket.raffle.product?.name || 'Sorteo',
                                winnerName: winnerTicket.user.name,
                                winnerEmail: winnerTicket.user.email,
                                ticketNumber: winnerTicket.number,
                                shopDashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
                            });
                        }
                        catch (error) {
                            this.logger.error('Error notificando a la tienda:', error);
                        }
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error ejecutando sorteo automáticamente ${raffle.id}:`, error);
                // No lanzar excepción para no interrumpir el flujo de creación de tickets
            }
        }
        return savedTickets;
    }
    async findAll() {
        return this.ticketsRepository.find({
            relations: ['raffle', 'user'],
        });
    }
    async findById(id) {
        const ticket = await this.ticketsRepository.findOne({
            where: { id },
            relations: ['raffle', 'user'],
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket no encontrado');
        }
        return ticket;
    }
    async findByRaffleId(raffleId) {
        return this.ticketsRepository.find({
            where: { raffleId },
            relations: ['user'],
            order: { number: 'ASC' },
        });
    }
    async findByUserId(userId) {
        return this.ticketsRepository.find({
            where: { userId },
            relations: ['raffle'],
            order: { purchasedAt: 'DESC' },
        });
    }
    async findByUserAndRaffle(userId, raffleId) {
        return this.ticketsRepository.find({
            where: { userId, raffleId },
            order: { number: 'ASC' },
        });
    }
    async markAsWinner(id) {
        const ticket = await this.findById(id);
        if (ticket.status !== raffle_ticket_entity_1.RaffleTicketStatus.SOLD) {
            throw new common_1.BadRequestException('Solo se pueden marcar como ganador tickets vendidos');
        }
        ticket.status = raffle_ticket_entity_1.RaffleTicketStatus.WINNER;
        return this.ticketsRepository.save(ticket);
    }
    async refund(id) {
        const ticket = await this.findById(id);
        if (ticket.status === raffle_ticket_entity_1.RaffleTicketStatus.WINNER) {
            throw new common_1.BadRequestException('No se puede reembolsar un ticket ganador');
        }
        ticket.status = raffle_ticket_entity_1.RaffleTicketStatus.REFUNDED;
        return this.ticketsRepository.save(ticket);
    }
    async countByRaffleId(raffleId) {
        return this.ticketsRepository.count({
            where: { raffleId, status: raffle_ticket_entity_1.RaffleTicketStatus.SOLD },
        });
    }
    async countWinnersByRaffleId(raffleId) {
        return this.ticketsRepository.count({
            where: { raffleId, status: raffle_ticket_entity_1.RaffleTicketStatus.WINNER },
        });
    }
    async delete(id) {
        const ticket = await this.findById(id);
        if (ticket.status === raffle_ticket_entity_1.RaffleTicketStatus.WINNER) {
            throw new common_1.BadRequestException('No se puede eliminar un ticket ganador');
        }
        await this.ticketsRepository.remove(ticket);
    }
};
exports.RaffleTicketsService = RaffleTicketsService;
exports.RaffleTicketsService = RaffleTicketsService = RaffleTicketsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(raffle_ticket_entity_1.RaffleTicket)),
    __param(1, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => raffle_execution_service_1.RaffleExecutionService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        raffle_execution_service_1.RaffleExecutionService,
        notification_event_service_1.NotificationEventService])
], RaffleTicketsService);
