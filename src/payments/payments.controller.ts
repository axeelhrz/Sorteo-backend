import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * PASO 5: Crear un pago pendiente
   * POST /payments
   * Body: { raffleId, amount, ticketQuantity }
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @CurrentUser() user: any,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(user.id, createPaymentDto);
  }

  /**
   * PASO 8A.2: Confirmar pago completado
   * POST /payments/confirm
   * Body: { paymentId, externalTransactionId, paymentMethod }
   */
  @Post('confirm')
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(confirmPaymentDto);
  }

  /**
   * PASO 8B.2: Registrar fallo de pago
   * POST /payments/:id/fail
   * Body: { failureReason }
   */
  @Post(':id/fail')
  async failPayment(
    @Param('id') paymentId: string,
    @Body('failureReason') failureReason: string,
  ) {
    return this.paymentsService.failPayment(paymentId, failureReason);
  }

  /**
   * Obtener un pago por ID
   * GET /payments/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPaymentById(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  /**
   * Obtener pagos del usuario actual
   * GET /payments/user/me
   */
  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async getMyPayments(@CurrentUser() user: any) {
    return this.paymentsService.getPaymentsByUserId(user.id);
  }

  /**
   * Obtener pagos completados de un sorteo
   * GET /payments/raffle/:raffleId
   */
  @Get('raffle/:raffleId')
  async getCompletedPaymentsByRaffleId(@Param('raffleId') raffleId: string) {
    return this.paymentsService.getCompletedPaymentsByRaffleId(raffleId);
  }

  /**
   * Obtener todos los pagos (admin)
   * GET /payments
   */
  @Get()
  async getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  /**
   * Reembolsar un pago
   * POST /payments/:id/refund
   */
  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  async refundPayment(@Param('id') paymentId: string) {
    return this.paymentsService.refundPayment(paymentId);
  }
}