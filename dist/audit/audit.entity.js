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
exports.AuditLog = exports.AuditAction = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
exports.AuditAction = {
    RAFFLE_APPROVED: 'raffle_approved',
    RAFFLE_REJECTED: 'raffle_rejected',
    RAFFLE_CANCELLED: 'raffle_cancelled',
    RAFFLE_EXECUTED: 'raffle_executed',
    RAFFLE_EXECUTION_FAILED: 'raffle_execution_failed',
    SHOP_STATUS_CHANGED: 'shop_status_changed',
    SHOP_VERIFIED: 'shop_verified',
    SHOP_BLOCKED: 'shop_blocked',
    USER_SUSPENDED: 'user_suspended',
    COMPLAINT_CREATED: 'complaint_created',
    COMPLAINT_UPDATED: 'complaint_updated',
    COMPLAINT_RESOLVED: 'complaint_resolved',
    TICKET_PURCHASED: 'ticket_purchased',
    PAYMENT_PROCESSED: 'payment_processed',
    PRODUCT_CREATED: 'product_created',
    PRODUCT_UPDATED: 'product_updated',
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
};
let AuditLog = class AuditLog {
};
exports.AuditLog = AuditLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AuditLog.prototype, "adminId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'adminId' }),
    __metadata("design:type", user_entity_1.User)
], AuditLog.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: exports.AuditAction,
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], AuditLog.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AuditLog.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "previousStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "newStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AuditLog.prototype, "createdAt", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, typeorm_1.Entity)('audit_logs'),
    (0, typeorm_1.Index)(['adminId']),
    (0, typeorm_1.Index)(['action']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['entityType'])
], AuditLog);
