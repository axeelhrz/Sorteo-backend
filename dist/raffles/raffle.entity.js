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
exports.Raffle = exports.RaffleStatus = void 0;
const typeorm_1 = require("typeorm");
const shop_entity_1 = require("../shops/shop.entity");
const product_entity_1 = require("../products/product.entity");
const raffle_ticket_entity_1 = require("../raffle-tickets/raffle-ticket.entity");
const deposit_entity_1 = require("../deposits/deposit.entity");
exports.RaffleStatus = {
    DRAFT: 'draft',
    PENDING_APPROVAL: 'pending_approval',
    ACTIVE: 'active',
    PAUSED: 'paused',
    SOLD_OUT: 'sold_out',
    FINISHED: 'finished',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
};
let Raffle = class Raffle {
};
exports.Raffle = Raffle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Raffle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Raffle.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, (shop) => shop.raffles, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'shopId' }),
    __metadata("design:type", shop_entity_1.Shop)
], Raffle.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Raffle.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.raffles, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", product_entity_1.Product)
], Raffle.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Raffle.prototype, "productValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], Raffle.prototype, "totalTickets", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Raffle.prototype, "soldTickets", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: exports.RaffleStatus,
        default: exports.RaffleStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Raffle.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Raffle.prototype, "requiresDeposit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Raffle.prototype, "winnerTicketId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Raffle.prototype, "specialConditions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Raffle.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Raffle.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Raffle.prototype, "activatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Raffle.prototype, "raffleExecutedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Raffle.prototype, "drawnBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Raffle.prototype, "drawTrigger", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Raffle.prototype, "totalValidTickets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => raffle_ticket_entity_1.RaffleTicket, (ticket) => ticket.raffle),
    __metadata("design:type", Array)
], Raffle.prototype, "tickets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => deposit_entity_1.Deposit, (deposit) => deposit.raffle),
    __metadata("design:type", Array)
], Raffle.prototype, "deposits", void 0);
exports.Raffle = Raffle = __decorate([
    (0, typeorm_1.Entity)('raffles'),
    (0, typeorm_1.Index)(['shopId']),
    (0, typeorm_1.Index)(['productId']),
    (0, typeorm_1.Index)(['status'])
], Raffle);
