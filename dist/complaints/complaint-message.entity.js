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
exports.ComplaintMessage = exports.MessageSender = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const complaint_entity_1 = require("./complaint.entity");
exports.MessageSender = {
    USER: 'user',
    ADMIN: 'admin',
    SHOP: 'shop',
};
let ComplaintMessage = class ComplaintMessage {
};
exports.ComplaintMessage = ComplaintMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ComplaintMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ComplaintMessage.prototype, "complaintId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => complaint_entity_1.Complaint, (complaint) => complaint.messages, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'complaintId' }),
    __metadata("design:type", complaint_entity_1.Complaint)
], ComplaintMessage.prototype, "complaint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ComplaintMessage.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'senderId' }),
    __metadata("design:type", user_entity_1.User)
], ComplaintMessage.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: exports.MessageSender,
    }),
    __metadata("design:type", String)
], ComplaintMessage.prototype, "senderType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ComplaintMessage.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ComplaintMessage.prototype, "createdAt", void 0);
exports.ComplaintMessage = ComplaintMessage = __decorate([
    (0, typeorm_1.Entity)('complaint_messages'),
    (0, typeorm_1.Index)(['complaintId']),
    (0, typeorm_1.Index)(['createdAt'])
], ComplaintMessage);
