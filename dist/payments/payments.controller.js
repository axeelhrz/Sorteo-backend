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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const confirm_payment_dto_1 = require("./dto/confirm-payment.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    /**
     * PASO 5: Crear un pago pendiente
     * POST /payments
     * Body: { raffleId, amount, ticketQuantity }
     */
    async createPayment(user, createPaymentDto) {
        return this.paymentsService.createPayment(user.id, createPaymentDto);
    }
    /**
     * PASO 8A.2: Confirmar pago completado
     * POST /payments/confirm
     * Body: { paymentId, externalTransactionId, paymentMethod }
     */
    async confirmPayment(confirmPaymentDto) {
        return this.paymentsService.confirmPayment(confirmPaymentDto);
    }
    /**
     * PASO 8B.2: Registrar fallo de pago
     * POST /payments/:id/fail
     * Body: { failureReason }
     */
    async failPayment(paymentId, failureReason) {
        return this.paymentsService.failPayment(paymentId, failureReason);
    }
    /**
     * Obtener un pago por ID
     * GET /payments/:id
     */
    async getPaymentById(id) {
        return this.paymentsService.getPaymentById(id);
    }
    /**
     * Obtener pagos del usuario actual
     * GET /payments/user/me
     */
    async getMyPayments(user) {
        return this.paymentsService.getPaymentsByUserId(user.id);
    }
    /**
     * Obtener pagos completados de un sorteo
     * GET /payments/raffle/:raffleId
     */
    async getCompletedPaymentsByRaffleId(raffleId) {
        return this.paymentsService.getCompletedPaymentsByRaffleId(raffleId);
    }
    /**
     * Obtener todos los pagos (admin)
     * GET /payments
     */
    async getAllPayments() {
        return this.paymentsService.getAllPayments();
    }
    /**
     * Reembolsar un pago
     * POST /payments/:id/refund
     */
    async refundPayment(paymentId) {
        return this.paymentsService.refundPayment(paymentId);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Post)('confirm'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_payment_dto_1.ConfirmPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Post)(':id/fail'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('failureReason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "failPayment", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentById", null);
__decorate([
    (0, common_1.Get)('user/me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getMyPayments", null);
__decorate([
    (0, common_1.Get)('raffle/:raffleId'),
    __param(0, (0, common_1.Param)('raffleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getCompletedPaymentsByRaffleId", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getAllPayments", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refundPayment", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('api/payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
