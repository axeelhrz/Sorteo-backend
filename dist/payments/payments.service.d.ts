import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { Raffle } from '../raffles/raffle.entity';
import { RaffleTicketsService } from '../raffle-tickets/raffle-tickets.service';
export declare class PaymentsService {
    private paymentsRepository;
    private rafflesRepository;
    private raffleTicketsService;
    constructor(paymentsRepository: Repository<Payment>, rafflesRepository: Repository<Raffle>, raffleTicketsService: RaffleTicketsService);
    /**
     * PASO 5: Crear un pago pendiente
     * Se ejecuta cuando el usuario hace clic en "Continuar con la compra"
     * Valida disponibilidad de tickets y crea registro de pago
     */
    createPayment(userId: string, createPaymentDto: CreatePaymentDto): Promise<Payment>;
    /**
     * PASO 8A.2: Confirmar pago completado
     * Se ejecuta cuando la pasarela retorna con éxito
     * Actualiza estado del pago a COMPLETED
     */
    confirmPayment(confirmPaymentDto: ConfirmPaymentDto): Promise<Payment>;
    /**
     * PASO 8B.2: Registrar fallo de pago
     * Se ejecuta cuando la pasarela rechaza el pago
     */
    failPayment(paymentId: string, failureReason: string): Promise<Payment>;
    /**
     * Obtener un pago por ID
     */
    getPaymentById(id: string): Promise<Payment>;
    /**
     * Obtener pagos de un usuario
     */
    getPaymentsByUserId(userId: string): Promise<Payment[]>;
    /**
     * Obtener pagos completados de un sorteo
     */
    getCompletedPaymentsByRaffleId(raffleId: string): Promise<Payment[]>;
    /**
     * Obtener todos los pagos (admin)
     */
    getAllPayments(): Promise<Payment[]>;
    /**
     * Reembolsar un pago
     */
    refundPayment(paymentId: string): Promise<Payment>;
}
