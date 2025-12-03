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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./payment.entity");
const raffle_entity_1 = require("../raffles/raffle.entity");
const raffle_tickets_service_1 = require("../raffle-tickets/raffle-tickets.service");
let PaymentsService = class PaymentsService {
    constructor(paymentsRepository, rafflesRepository, raffleTicketsService) {
        this.paymentsRepository = paymentsRepository;
        this.rafflesRepository = rafflesRepository;
        this.raffleTicketsService = raffleTicketsService;
    }
    /**
     * PASO 5: Crear un pago pendiente
     * Se ejecuta cuando el usuario hace clic en "Continuar con la compra"
     * Valida disponibilidad de tickets y crea registro de pago
     */
    async createPayment(userId, createPaymentDto) {
        // Validar que el sorteo existe
        const raffle = await this.rafflesRepository.findOne({
            where: { id: createPaymentDto.raffleId },
        });
        if (!raffle) {
            throw new common_1.NotFoundException('Sorteo no encontrado');
        }
        // CONTROL DE CONCURRENCIA: Validar estado del sorteo
        if (raffle.status !== raffle_entity_1.RaffleStatus.ACTIVE) {
            throw new common_1.BadRequestException('Este sorteo ya no está disponible para compra');
        }
        // CONTROL DE CONCURRENCIA: Validar disponibilidad de tickets
        const availableTickets = raffle.totalTickets - raffle.soldTickets;
        if (createPaymentDto.ticketQuantity > availableTickets) {
            throw new common_1.BadRequestException(`No hay suficientes tickets disponibles. Quedan ${availableTickets} tickets.`);
        }
        // Validar cantidad mínima
        if (createPaymentDto.ticketQuantity < 1) {
            throw new common_1.BadRequestException('Debe comprar al menos 1 ticket');
        }
        // Crear registro de pago con estado PENDING
        const payment = this.paymentsRepository.create({
            userId,
            raffleId: createPaymentDto.raffleId,
            amount: createPaymentDto.amount,
            currency: 'PEN',
            status: payment_entity_1.PaymentStatus.PENDING,
            ticketQuantity: createPaymentDto.ticketQuantity,
            paymentMethod: null,
            externalTransactionId: null,
        });
        return this.paymentsRepository.save(payment);
    }
    /**
     * PASO 8A.2: Confirmar pago completado
     * Se ejecuta cuando la pasarela retorna con éxito
     * Actualiza estado del pago a COMPLETED
     */
    async confirmPayment(confirmPaymentDto) {
        const payment = await this.paymentsRepository.findOne({
            where: { id: confirmPaymentDto.paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pago no encontrado');
        }
        if (payment.status !== payment_entity_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Este pago ya ha sido procesado');
        }
        // Actualizar pago a COMPLETED
        payment.status = payment_entity_1.PaymentStatus.COMPLETED;
        payment.externalTransactionId = confirmPaymentDto.externalTransactionId;
        payment.paymentMethod = confirmPaymentDto.paymentMethod;
        payment.completedAt = new Date();
        const updatedPayment = await this.paymentsRepository.save(payment);
        // PASO 8A.3: Crear tickets
        await this.raffleTicketsService.create({
            raffleId: payment.raffleId,
            userId: payment.userId,
            quantity: payment.ticketQuantity,
            paymentId: payment.id,
        });
        return updatedPayment;
    }
    /**
     * PASO 8B.2: Registrar fallo de pago
     * Se ejecuta cuando la pasarela rechaza el pago
     */
    async failPayment(paymentId, failureReason) {
        const payment = await this.paymentsRepository.findOne({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pago no encontrado');
        }
        if (payment.status !== payment_entity_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Este pago ya ha sido procesado');
        }
        // Actualizar pago a FAILED
        payment.status = payment_entity_1.PaymentStatus.FAILED;
        payment.failureReason = failureReason;
        payment.failedAt = new Date();
        // NO se crean tickets
        // NO se modifica soldTickets del sorteo
        return this.paymentsRepository.save(payment);
    }
    /**
     * Obtener un pago por ID
     */
    async getPaymentById(id) {
        const payment = await this.paymentsRepository.findOne({
            where: { id },
            relations: ['user', 'raffle'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pago no encontrado');
        }
        return payment;
    }
    /**
     * Obtener pagos de un usuario
     */
    async getPaymentsByUserId(userId) {
        return this.paymentsRepository.find({
            where: { userId },
            relations: ['raffle'],
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Obtener pagos completados de un sorteo
     */
    async getCompletedPaymentsByRaffleId(raffleId) {
        return this.paymentsRepository.find({
            where: {
                raffleId,
                status: payment_entity_1.PaymentStatus.COMPLETED,
            },
            relations: ['user'],
            order: { completedAt: 'DESC' },
        });
    }
    /**
     * Obtener todos los pagos (admin)
     */
    async getAllPayments() {
        return this.paymentsRepository.find({
            relations: ['user', 'raffle'],
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Reembolsar un pago
     */
    async refundPayment(paymentId) {
        const payment = await this.getPaymentById(paymentId);
        if (payment.status !== payment_entity_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Solo se pueden reembolsar pagos completados');
        }
        payment.status = payment_entity_1.PaymentStatus.REFUNDED;
        return this.paymentsRepository.save(payment);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        raffle_tickets_service_1.RaffleTicketsService])
], PaymentsService);
