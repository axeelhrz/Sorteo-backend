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
exports.RaffleExecutionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const raffle_entity_1 = require("./raffle.entity");
const raffle_ticket_entity_1 = require("../raffle-tickets/raffle-ticket.entity");
const audit_service_1 = require("../audit/audit.service");
const audit_entity_1 = require("../audit/audit.entity");
let RaffleExecutionService = class RaffleExecutionService {
    constructor(rafflesRepository, ticketsRepository, auditService, dataSource) {
        this.rafflesRepository = rafflesRepository;
        this.ticketsRepository = ticketsRepository;
        this.auditService = auditService;
        this.dataSource = dataSource;
        this.executingRaffles = new Set(); // Mutex en memoria para evitar doble ejecución
    }
    /**
     * Ejecutar sorteo de forma segura con lock transaccional
     * Previene doble ejecución y garantiza consistencia
     */
    async executeRaffleSecurely(raffleId, adminId) {
        // Verificar si ya está en ejecución (mutex)
        if (this.executingRaffles.has(raffleId)) {
            throw new common_1.ConflictException('This raffle is already being executed');
        }
        this.executingRaffles.add(raffleId);
        try {
            // Usar transacción para garantizar consistencia
            return await this.dataSource.transaction(async (manager) => {
                // Obtener sorteo con lock FOR UPDATE
                const raffle = await manager
                    .createQueryBuilder(raffle_entity_1.Raffle, 'raffle')
                    .where('raffle.id = :id', { id: raffleId })
                    .setLock('pessimistic_write')
                    .getOne();
                if (!raffle) {
                    throw new common_1.NotFoundException('Raffle not found');
                }
                // Validar que el sorteo no ha sido ejecutado
                if (raffle.status === raffle_entity_1.RaffleStatus.FINISHED) {
                    throw new common_1.BadRequestException('This raffle has already been executed');
                }
                // Validar que el sorteo está en estado válido
                if (raffle.status !== raffle_entity_1.RaffleStatus.SOLD_OUT && raffle.status !== raffle_entity_1.RaffleStatus.ACTIVE) {
                    throw new common_1.BadRequestException(`Raffle must be ACTIVE or SOLD_OUT to execute. Current status: ${raffle.status}`);
                }
                // Validar que hay tickets vendidos
                if (raffle.soldTickets === 0) {
                    throw new common_1.BadRequestException('Cannot execute raffle with no tickets sold');
                }
                // Obtener todos los tickets del sorteo
                const tickets = await manager.find(raffle_ticket_entity_1.RaffleTicket, {
                    where: { raffleId },
                });
                if (tickets.length === 0) {
                    throw new common_1.BadRequestException('No tickets found for this raffle');
                }
                // Validar consistencia: cantidad de tickets debe coincidir con soldTickets
                if (tickets.length !== raffle.soldTickets) {
                    throw new common_1.ConflictException(`Ticket count mismatch. Expected ${raffle.soldTickets}, found ${tickets.length}`);
                }
                // Seleccionar ganador aleatoriamente
                const winnerTicket = tickets[Math.floor(Math.random() * tickets.length)];
                // Actualizar sorteo
                raffle.winnerTicketId = winnerTicket.id;
                raffle.status = raffle_entity_1.RaffleStatus.FINISHED;
                raffle.raffleExecutedAt = new Date();
                const updatedRaffle = await manager.save(raffle);
                // Registrar en auditoría
                await this.auditService.log(adminId, audit_entity_1.AuditAction.RAFFLE_EXECUTED, 'Raffle', raffleId, {
                    previousStatus: raffle_entity_1.RaffleStatus.ACTIVE,
                    newStatus: raffle_entity_1.RaffleStatus.FINISHED,
                    details: {
                        winnerTicketId: winnerTicket.id,
                        winnerUserId: winnerTicket.userId,
                        totalTickets: tickets.length,
                        timestamp: new Date().toISOString(),
                    },
                });
                return updatedRaffle;
            });
        }
        finally {
            // Remover del mutex
            this.executingRaffles.delete(raffleId);
        }
    }
    /**
     * Ejecutar automáticamente un sorteo cuando todos los tickets están vendidos
     * Este método se llama automáticamente cuando un sorteo pasa a sold_out
     */
    async autoExecuteWhenSoldOut(raffleId) {
        try {
            const raffle = await this.rafflesRepository.findOne({
                where: { id: raffleId },
                relations: ['shop', 'product', 'tickets'],
            });
            if (!raffle) {
                throw new common_1.NotFoundException('Raffle not found');
            }
            // Validar que el sorteo está en estado sold_out
            if (raffle.status !== raffle_entity_1.RaffleStatus.SOLD_OUT) {
                return null; // No está listo para ejecutarse
            }
            // Validar que ya tiene ganador (no ejecutar dos veces)
            if (raffle.winnerTicketId) {
                return raffle; // Ya fue ejecutado
            }
            // Validar que todos los tickets están vendidos
            if (raffle.soldTickets !== raffle.totalTickets) {
                return null; // Aún no están todos vendidos
            }
            // Ejecutar el sorteo automáticamente (sin adminId, usar sistema)
            const systemAdminId = 'system-auto-execution';
            return await this.executeRaffleSecurely(raffleId, systemAdminId);
        }
        catch (error) {
            // Log error pero no lanzar excepción para no interrumpir el flujo
            console.error(`Error ejecutando sorteo automáticamente ${raffleId}:`, error);
            return null;
        }
    }
    /**
     * Validar consistencia de tickets antes de ejecutar
     */
    async validateTicketConsistency(raffleId) {
        const errors = [];
        const raffle = await this.rafflesRepository.findOne({ where: { id: raffleId } });
        if (!raffle) {
            errors.push('Raffle not found');
            return { valid: false, errors };
        }
        const tickets = await this.ticketsRepository.find({ where: { raffleId } });
        if (tickets.length !== raffle.soldTickets) {
            errors.push(`Ticket count mismatch: expected ${raffle.soldTickets}, found ${tickets.length}`);
        }
        // Validar que no hay tickets duplicados
        const ticketIds = new Set(tickets.map(t => t.id));
        if (ticketIds.size !== tickets.length) {
            errors.push('Duplicate tickets found');
        }
        // Validar que todos los tickets tienen usuario
        const ticketsWithoutUser = tickets.filter(t => !t.userId);
        if (ticketsWithoutUser.length > 0) {
            errors.push(`Found ${ticketsWithoutUser.length} tickets without user`);
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
};
exports.RaffleExecutionService = RaffleExecutionService;
exports.RaffleExecutionService = RaffleExecutionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __param(1, (0, typeorm_1.InjectRepository)(raffle_ticket_entity_1.RaffleTicket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService,
        typeorm_2.DataSource])
], RaffleExecutionService);
