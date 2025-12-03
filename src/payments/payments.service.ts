import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { Raffle, RaffleStatus } from '../raffles/raffle.entity';
import { RaffleTicketsService } from '../raffle-tickets/raffle-tickets.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Raffle)
    private rafflesRepository: Repository<Raffle>,
    private raffleTicketsService: RaffleTicketsService,
  ) {}

  /**
   * PASO 5: Crear un pago pendiente
   * Se ejecuta cuando el usuario hace clic en "Continuar con la compra"
   * Valida disponibilidad de tickets y crea registro de pago
   */
  async createPayment(
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    // Validar que el sorteo existe
    const raffle = await this.rafflesRepository.findOne({
      where: { id: createPaymentDto.raffleId },
    });

    if (!raffle) {
      throw new NotFoundException('Sorteo no encontrado');
    }

    // CONTROL DE CONCURRENCIA: Validar estado del sorteo
    if (raffle.status !== RaffleStatus.ACTIVE) {
      throw new BadRequestException('Este sorteo ya no está disponible para compra');
    }

    // CONTROL DE CONCURRENCIA: Validar disponibilidad de tickets
    const availableTickets = raffle.totalTickets - raffle.soldTickets;
    if (createPaymentDto.ticketQuantity > availableTickets) {
      throw new BadRequestException(
        `No hay suficientes tickets disponibles. Quedan ${availableTickets} tickets.`,
      );
    }

    // Validar cantidad mínima
    if (createPaymentDto.ticketQuantity < 1) {
      throw new BadRequestException('Debe comprar al menos 1 ticket');
    }

    // Crear registro de pago con estado PENDING
    const payment = this.paymentsRepository.create({
      userId,
      raffleId: createPaymentDto.raffleId,
      amount: createPaymentDto.amount,
      currency: 'PEN',
      status: PaymentStatus.PENDING,
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
  async confirmPayment(
    confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: confirmPaymentDto.paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Este pago ya ha sido procesado');
    }

    // Actualizar pago a COMPLETED
    payment.status = PaymentStatus.COMPLETED;
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
  async failPayment(
    paymentId: string,
    failureReason: string,
  ): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Este pago ya ha sido procesado');
    }

    // Actualizar pago a FAILED
    payment.status = PaymentStatus.FAILED;
    payment.failureReason = failureReason;
    payment.failedAt = new Date();

    // NO se crean tickets
    // NO se modifica soldTickets del sorteo

    return this.paymentsRepository.save(payment);
  }

  /**
   * Obtener un pago por ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['user', 'raffle'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    return payment;
  }

  /**
   * Obtener pagos de un usuario
   */
  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { userId },
      relations: ['raffle'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener pagos completados de un sorteo
   */
  async getCompletedPaymentsByRaffleId(raffleId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: {
        raffleId,
        status: PaymentStatus.COMPLETED,
      },
      relations: ['user'],
      order: { completedAt: 'DESC' },
    });
  }

  /**
   * Obtener todos los pagos (admin)
   */
  async getAllPayments(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ['user', 'raffle'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Reembolsar un pago
   */
  async refundPayment(paymentId: string): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Solo se pueden reembolsar pagos completados');
    }

    payment.status = PaymentStatus.REFUNDED;
    return this.paymentsRepository.save(payment);
  }
}