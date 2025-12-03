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
exports.RaffleTicketsController = void 0;
const common_1 = require("@nestjs/common");
const raffle_tickets_service_1 = require("./raffle-tickets.service");
const create_raffle_ticket_dto_1 = require("./dto/create-raffle-ticket.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let RaffleTicketsController = class RaffleTicketsController {
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    async create(createTicketDto) {
        return this.ticketsService.create(createTicketDto);
    }
    async findAll(req, raffleId, userId) {
        // Si hay raffleId, obtener tickets del usuario autenticado para ese sorteo
        if (raffleId) {
            const authenticatedUserId = req.user?.id;
            if (authenticatedUserId) {
                return this.ticketsService.findByUserAndRaffle(authenticatedUserId, raffleId);
            }
            // Si no está autenticado pero hay raffleId, devolver todos los tickets del sorteo (público)
            return this.ticketsService.findByRaffleId(raffleId);
        }
        // Si hay userId, usar el autenticado
        const authenticatedUserId = req.user?.id || userId;
        if (authenticatedUserId) {
            return this.ticketsService.findByUserId(authenticatedUserId);
        }
        return this.ticketsService.findAll();
    }
    async findOne(id) {
        return this.ticketsService.findById(id);
    }
    async findByRaffle(raffleId) {
        return this.ticketsService.findByRaffleId(raffleId);
    }
    async findByUser(userId) {
        return this.ticketsService.findByUserId(userId);
    }
    async markAsWinner(id) {
        return this.ticketsService.markAsWinner(id);
    }
    async refund(id) {
        return this.ticketsService.refund(id);
    }
};
exports.RaffleTicketsController = RaffleTicketsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_raffle_ticket_dto_1.CreateRaffleTicketDto]),
    __metadata("design:returntype", Promise)
], RaffleTicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('raffleId')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RaffleTicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RaffleTicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('raffle/:raffleId'),
    __param(0, (0, common_1.Param)('raffleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RaffleTicketsController.prototype, "findByRaffle", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RaffleTicketsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Put)(':id/mark-winner'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RaffleTicketsController.prototype, "markAsWinner", null);
__decorate([
    (0, common_1.Put)(':id/refund'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RaffleTicketsController.prototype, "refund", null);
exports.RaffleTicketsController = RaffleTicketsController = __decorate([
    (0, common_1.Controller)('api/raffle-tickets'),
    __metadata("design:paramtypes", [raffle_tickets_service_1.RaffleTicketsService])
], RaffleTicketsController);
