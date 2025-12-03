import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Raffle, RaffleStatus } from '../raffles/raffle.entity';
import { Shop, ShopStatus } from '../shops/shop.entity';
import { User, UserRole } from '../users/user.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit.entity';
import { RaffleExecutionService } from '../raffles/raffle-execution.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Raffle)
    private rafflesRepository: Repository<Raffle>,
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private auditService: AuditService,
    private raffleExecutionService: RaffleExecutionService,
  ) {}

  // ============ DASHBOARD ============
  async getDashboardStats() {
    const totalUsers = await this.usersRepository.count();
    const totalShops = await this.shopsRepository.count();
    const pendingShops = await this.shopsRepository.count({
      where: { status: ShopStatus.PENDING },
    });
    const verifiedShops = await this.shopsRepository.count({
      where: { status: ShopStatus.VERIFIED },
    });
    const blockedShops = await this.shopsRepository.count({
      where: { status: ShopStatus.BLOCKED },
    });

    const pendingRaffles = await this.rafflesRepository.count({
      where: { status: RaffleStatus.PENDING_APPROVAL },
    });
    const activeRaffles = await this.rafflesRepository.count({
      where: { status: RaffleStatus.ACTIVE },
    });
    const finishedRaffles = await this.rafflesRepository.count({
      where: { status: RaffleStatus.FINISHED },
    });
    const cancelledRaffles = await this.rafflesRepository.count({
      where: { status: RaffleStatus.CANCELLED },
    });
    const rejectedRaffles = await this.rafflesRepository.count({
      where: { status: RaffleStatus.REJECTED },
    });

    // Calcular total de tickets vendidos
    const raffles = await this.rafflesRepository.find();
    const totalTicketsSold = raffles.reduce((sum, r) => sum + r.soldTickets, 0);

    // Estadísticas de pagos y transacciones
    const totalPayments = await this.paymentsRepository.count();
    const completedPayments = await this.paymentsRepository.count({
      where: { status: PaymentStatus.COMPLETED },
    });
    const pendingPayments = await this.paymentsRepository.count({
      where: { status: PaymentStatus.PENDING },
    });
    const failedPayments = await this.paymentsRepository.count({
      where: { status: PaymentStatus.FAILED },
    });
    const refundedPayments = await this.paymentsRepository.count({
      where: { status: PaymentStatus.REFUNDED },
    });

    // Calcular monto total de pagos completados
    const completedPaymentsList = await this.paymentsRepository.find({
      where: { status: PaymentStatus.COMPLETED },
    });
    const totalRevenue = completedPaymentsList.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      users: {
        total: totalUsers,
      },
      shops: {
        total: totalShops,
        pending: pendingShops,
        verified: verifiedShops,
        blocked: blockedShops,
      },
      raffles: {
        pending: pendingRaffles,
        active: activeRaffles,
        finished: finishedRaffles,
        cancelled: cancelledRaffles,
        rejected: rejectedRaffles,
      },
      tickets: {
        totalSold: totalTicketsSold,
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        pending: pendingPayments,
        failed: failedPayments,
        refunded: refundedPayments,
        totalRevenue,
      },
    };
  }

  // ============ RAFFLES ============
  async getPendingRaffles(limit = 50, offset = 0) {
    const [raffles, total] = await this.rafflesRepository.findAndCount({
      where: { status: RaffleStatus.PENDING_APPROVAL },
      relations: ['shop', 'product'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { data: raffles, total };
  }

  async getActiveRaffles(limit = 50, offset = 0, filters?: { shopId?: string }) {
    const query = this.rafflesRepository.createQueryBuilder('raffle')
      .where('raffle.status = :status', { status: RaffleStatus.ACTIVE })
      .leftJoinAndSelect('raffle.shop', 'shop')
      .leftJoinAndSelect('raffle.product', 'product')
      .orderBy('raffle.createdAt', 'DESC');

    if (filters?.shopId) {
      query.andWhere('raffle.shopId = :shopId', { shopId: filters.shopId });
    }

    query.take(limit).skip(offset);

    return query.getManyAndCount();
  }

  async getFinishedRaffles(limit = 50, offset = 0, filters?: { shopId?: string }) {
    const query = this.rafflesRepository.createQueryBuilder('raffle')
      .where('raffle.status IN (:...statuses)', {
        statuses: [RaffleStatus.FINISHED, RaffleStatus.SOLD_OUT],
      })
      .leftJoinAndSelect('raffle.shop', 'shop')
      .leftJoinAndSelect('raffle.product', 'product')
      .leftJoinAndSelect('raffle.tickets', 'tickets')
      .orderBy('raffle.raffleExecutedAt', 'DESC');

    if (filters?.shopId) {
      query.andWhere('raffle.shopId = :shopId', { shopId: filters.shopId });
    }

    query.take(limit).skip(offset);

    return query.getManyAndCount();
  }

  async getRaffleDetail(raffleId: string) {
    const raffle = await this.rafflesRepository.findOne({
      where: { id: raffleId },
      relations: ['shop', 'product', 'tickets', 'deposits'],
    });

    if (!raffle) {
      throw new NotFoundException('Sorteo no encontrado');
    }

    return raffle;
  }

  async approveRaffle(raffleId: string, adminId: string) {
    const raffle = await this.getRaffleDetail(raffleId);

    if (raffle.status !== RaffleStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Solo los sorteos pendientes pueden ser aprobados');
    }

    const previousStatus = raffle.status;
    raffle.status = RaffleStatus.ACTIVE;
    raffle.activatedAt = new Date();

    const updated = await this.rafflesRepository.save(raffle);

    // Registrar en auditoría
    await this.auditService.log(
      adminId,
      AuditAction.RAFFLE_APPROVED,
      'raffle',
      raffleId,
      {
        previousStatus,
        newStatus: RaffleStatus.ACTIVE,
      },
    );

    return updated;
  }

  async rejectRaffle(raffleId: string, adminId: string, reason: string) {
    const raffle = await this.getRaffleDetail(raffleId);

    if (raffle.status !== RaffleStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Solo los sorteos pendientes pueden ser rechazados');
    }

    const previousStatus = raffle.status;
    raffle.status = RaffleStatus.REJECTED;

    const updated = await this.rafflesRepository.save(raffle);

    // Registrar en auditoría
    await this.auditService.log(
      adminId,
      AuditAction.RAFFLE_REJECTED,
      'raffle',
      raffleId,
      {
        previousStatus,
        newStatus: RaffleStatus.REJECTED,
        reason,
      },
    );

    return updated;
  }

  async cancelRaffle(raffleId: string, adminId: string, reason: string) {
    const raffle = await this.getRaffleDetail(raffleId);

    if (raffle.status === RaffleStatus.FINISHED) {
      throw new BadRequestException('No se puede cancelar un sorteo finalizado');
    }

    const previousStatus = raffle.status;
    raffle.status = RaffleStatus.CANCELLED;

    const updated = await this.rafflesRepository.save(raffle);

    // Registrar en auditoría
    await this.auditService.log(
      adminId,
      AuditAction.RAFFLE_CANCELLED,
      'raffle',
      raffleId,
      {
        previousStatus,
        newStatus: RaffleStatus.CANCELLED,
        reason,
      },
    );

    return updated;
  }

  async executeRaffle(raffleId: string, adminId: string) {
    return this.raffleExecutionService.executeRaffleSecurely(raffleId, adminId);
  }

  // ============ SHOPS ============
  async getAllShops(limit = 50, offset = 0, filters?: { status?: ShopStatus }) {
    const query = this.shopsRepository.createQueryBuilder('shop')
      .leftJoinAndSelect('shop.user', 'user')
      .leftJoinAndSelect('shop.raffles', 'raffles')
      .orderBy('shop.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('shop.status = :status', { status: filters.status });
    }

    query.take(limit).skip(offset);

    return query.getManyAndCount();
  }

  async getShopDetail(shopId: string) {
    const shop = await this.shopsRepository.findOne({
      where: { id: shopId },
      relations: ['user', 'raffles', 'products', 'deposits'],
    });

    if (!shop) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Calcular estadísticas
    const stats = {
      totalRaffles: shop.raffles?.length || 0,
      activeRaffles: shop.raffles?.filter((r) => r.status === RaffleStatus.ACTIVE).length || 0,
      finishedRaffles: shop.raffles?.filter((r) => r.status === RaffleStatus.FINISHED).length || 0,
      cancelledRaffles: shop.raffles?.filter((r) => r.status === RaffleStatus.CANCELLED).length || 0,
    };

    return { ...shop, stats };
  }

  async changeShopStatus(shopId: string, newStatus: ShopStatus, adminId: string, reason?: string) {
    const shop = await this.getShopDetail(shopId);

    if (shop.status === newStatus) {
      throw new BadRequestException('El estado es igual al actual');
    }

    const previousStatus = shop.status;
    shop.status = newStatus;

    const updated = await this.shopsRepository.save(shop);

    // Registrar en auditoría
    const action =
      newStatus === ShopStatus.VERIFIED
        ? AuditAction.SHOP_VERIFIED
        : newStatus === ShopStatus.BLOCKED
          ? AuditAction.SHOP_BLOCKED
          : AuditAction.SHOP_STATUS_CHANGED;

    await this.auditService.log(
      adminId,
      action,
      'shop',
      shopId,
      {
        previousStatus,
        newStatus,
        reason,
      },
    );

    return updated;
  }

  // ============ USERS ============
  async getAllUsers(limit = 50, offset = 0, filters?: { role?: UserRole }) {
    const query = this.usersRepository.createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (filters?.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }

    query.take(limit).skip(offset);

    return query.getManyAndCount();
  }

  async getUserDetail(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener información adicional según el rol
    let additionalInfo = {};

    if (user.role === UserRole.SHOP) {
      const shops = await this.shopsRepository.find({
        where: { userId },
        relations: ['raffles'],
      });
      additionalInfo = { shops };
    }

    return { ...user, additionalInfo };
  }

  // ============ PAYMENTS ============
  async getAllPayments(limit = 50, offset = 0, filters?: { status?: PaymentStatus; userId?: string; raffleId?: string }) {
    const query = this.paymentsRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('payment.raffle', 'raffle')
      .leftJoinAndSelect('raffle.product', 'product')
      .leftJoinAndSelect('raffle.shop', 'shop')
      .orderBy('payment.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters?.userId) {
      query.andWhere('payment.userId = :userId', { userId: filters.userId });
    }

    if (filters?.raffleId) {
      query.andWhere('payment.raffleId = :raffleId', { raffleId: filters.raffleId });
    }

    query.take(limit).skip(offset);

    return query.getManyAndCount();
  }

  async getPaymentDetail(paymentId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['user', 'raffle', 'raffle.product', 'raffle.shop'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    return payment;
  }
}