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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaffleTicket = exports.RaffleTicketStatus = void 0;
const typeorm_1 = require("typeorm");
const raffle_entity_1 = require("../raffles/raffle.entity");
const user_entity_1 = require("../users/user.entity");
exports.RaffleTicketStatus = {
    SOLD: 'sold',
    WINNER: 'winner',
    REFUNDED: 'refunded',
};
let RaffleTicket = class RaffleTicket {
};
exports.RaffleTicket = RaffleTicket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RaffleTicket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RaffleTicket.prototype, "raffleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => raffle_entity_1.Raffle, (raffle) => raffle.tickets, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'raffleId' }),
    __metadata("design:type", raffle_entity_1.Raffle)
], RaffleTicket.prototype, "raffle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RaffleTicket.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], RaffleTicket.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], RaffleTicket.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: exports.RaffleTicketStatus,
        default: exports.RaffleTicketStatus.SOLD,
    }),
    __metadata("design:type", String)
], RaffleTicket.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RaffleTicket.prototype, "purchasedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RaffleTicket.prototype, "paymentId", void 0);
exports.RaffleTicket = RaffleTicket = __decorate([
    (0, typeorm_1.Entity)('raffle_tickets'),
    (0, typeorm_1.Index)(['raffleId']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Unique)(['raffleId', 'number'])
], RaffleTicket);
