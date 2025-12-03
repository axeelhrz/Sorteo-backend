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
exports.Complaint = exports.ComplaintResolution = exports.ComplaintStatus = exports.ComplaintType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const shop_entity_1 = require("../shops/shop.entity");
const raffle_entity_1 = require("../raffles/raffle.entity");
const payment_entity_1 = require("../payments/payment.entity");
const complaint_message_entity_1 = require("./complaint-message.entity");
const complaint_attachment_entity_1 = require("./complaint-attachment.entity");
exports.ComplaintType = {
    PRIZE_NOT_DELIVERED: 'prize_not_delivered',
    DIFFERENT_PRODUCT: 'different_product',
    PURCHASE_PROBLEM: 'purchase_problem',
    SHOP_BEHAVIOR: 'shop_behavior',
    RAFFLE_FRAUD: 'raffle_fraud',
    TECHNICAL_ISSUE: 'technical_issue',
    PAYMENT_ERROR: 'payment_error',
};
exports.ComplaintStatus = {
    PENDING: 'pending',
    IN_REVIEW: 'in_review',
    RESOLVED: 'resolved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
};
exports.ComplaintResolution = {
    RESOLVED_USER_FAVOR: 'resolved_user_favor',
    RESOLVED_SHOP_FAVOR: 'resolved_shop_favor',
    RESOLVED_PLATFORM_FAVOR: 'resolved_platform_favor',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
};
let Complaint = class Complaint {
};
exports.Complaint = Complaint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Complaint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Complaint.prototype, "complaintNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Complaint.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Complaint.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Complaint.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'shopId' }),
    __metadata("design:type", shop_entity_1.Shop)
], Complaint.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Complaint.prototype, "raffleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => raffle_entity_1.Raffle, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'raffleId' }),
    __metadata("design:type", raffle_entity_1.Raffle)
], Complaint.prototype, "raffle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Complaint.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_entity_1.Payment, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'paymentId' }),
    __metadata("design:type", payment_entity_1.Payment)
], Complaint.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: exports.ComplaintType,
    }),
    __metadata("design:type", String)
], Complaint.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Complaint.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: exports.ComplaintStatus,
        default: exports.ComplaintStatus.PENDING,
    }),
    __metadata("design:type", String)
], Complaint.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: exports.ComplaintResolution,
        nullable: true,
    }),
    __metadata("design:type", String)
], Complaint.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Complaint.prototype, "assignedAdminId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assignedAdminId' }),
    __metadata("design:type", user_entity_1.User)
], Complaint.prototype, "assignedAdmin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Complaint.prototype, "resolutionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Complaint.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Complaint.prototype, "maxResponseDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Complaint.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Complaint.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => complaint_message_entity_1.ComplaintMessage, (message) => message.complaint, { cascade: true }),
    __metadata("design:type", Array)
], Complaint.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => complaint_attachment_entity_1.ComplaintAttachment, (attachment) => attachment.complaint, { cascade: true }),
    __metadata("design:type", Array)
], Complaint.prototype, "attachments", void 0);
exports.Complaint = Complaint = __decorate([
    (0, typeorm_1.Entity)('complaints'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['shopId']),
    (0, typeorm_1.Index)(['raffleId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['complaintNumber'])
], Complaint);
