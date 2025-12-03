import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deposit, DepositStatus } from './deposit.entity';
import { Product } from '../products/product.entity';
import { Raffle } from '../raffles/raffle.entity';
import { Shop } from '../shops/shop.entity';
import { CreateDepositDto, UpdateDepositStatusDto } from './dto/create-deposit.dto';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class DepositsService {
  constructor(
    @InjectRepository(Deposit)
    private depositsRepository: Repository<Deposit>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Raffle)
    private rafflesRepository: Repository<Raffle>,
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
    private notificationService: NotificationService,
  ) {}

  /**
   * Calcula si un producto requiere depósito basado en sus dimensiones
   * Máximo permitido: 15x15x15 cm
   */
  async calculateDepositRequirement(product: Product): Promise<{
    requiresDeposit: boolean;
    depositAmount: number;
    reason: string;
  }> {
    const MAX_DIMENSION = 15; // cm

    const exceedsDimensions =
      product.height > MAX_DIMENSION ||
      product.width > MAX_DIMENSION ||
      product.depth > MAX_DIMENSION;

    if (exceedsDimensions) {
      return {
        requiresDeposit: true,
        depositAmount: Number(product.value),
        reason: `Producto excede dimensiones máximas (15x15x15cm). Dimensiones actuales: ${product.height}x${product.width}x${product.depth}cm`,
      };
    }

    return {
      requiresDeposit: false,
      depositAmount: 0,
      reason: 'Producto dentro de dimensiones permitidas',
    };
  }

  /**
   * Valida las dimensiones de un producto
   */
  validateDimensions(height: number, width: number, depth: number): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const MAX_DIMENSION = 15;

    if (height <= 0) errors.push('Alto debe ser mayor a 0');
    if (width <= 0) errors.push('Ancho debe ser mayor a 0');
    if (depth <= 0) errors.push('Profundidad debe ser mayor a 0');

    if (height > MAX_DIMENSION) errors.push(`Alto no puede exceder ${MAX_DIMENSION}cm`);
    if (width > MAX_DIMENSION) errors.push(`Ancho no puede exceder ${MAX_DIMENSION}cm`);
    if (depth > MAX_DIMENSION) errors.push(`Profundidad no puede exceder ${MAX_DIMENSION}cm`);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Crea un depósito de garantía para un sorteo
   */
  async createDepositForRaffle(
    raffle: Raffle,
    product: Product,
  ): Promise<Deposit> {
    const depositRequirement = await this.calculateDepositRequirement(product);

    if (!depositRequirement.requiresDeposit) {
      return null;
    }

    const deposit = this.depositsRepository.create({
      shopId: raffle.shopId,
      raffleId: raffle.id,
      amount: depositRequirement.depositAmount,
      status: DepositStatus.PENDING,
      notes: `Depósito de garantía para sorteo de ${product.name}. ${depositRequirement.reason}`,
    });

    const savedDeposit = await this.depositsRepository.save(deposit);

    // Cargar la tienda si no está presente
    let shop = raffle.shop;
    if (!shop) {
      shop = await this.shopsRepository.findOne({
        where: { id: raffle.shopId },
        relations: ['user'],
      });
    }

    // Notificar a la tienda
    if (shop) {
      await this.notificationService.notifyDepositCreated(shop, savedDeposit, product);
    }

    return savedDeposit;
  }

  /**
   * Obtiene todos los depósitos de una tienda
   */
  async getDepositsByShop(shopId: string): Promise<Deposit[]> {
    return this.depositsRepository.find({
      where: { shopId },
      relations: ['raffle', 'raffle.product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene un depósito por ID
   */
  async getDepositById(depositId: string): Promise<Deposit> {
    const deposit = await this.depositsRepository.findOne({
      where: { id: depositId },
      relations: ['raffle', 'raffle.product', 'shop', 'shop.user'],
    });

    if (!deposit) {
      throw new NotFoundException('Depósito no encontrado');
    }

    return deposit;
  }

  /**
   * Obtiene depósitos por estado
   */
  async getDepositsByStatus(shopId: string, status: DepositStatus): Promise<Deposit[]> {
    return this.depositsRepository.find({
      where: { shopId, status },
      relations: ['raffle', 'raffle.product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Libera un depósito (cuando el sorteo se completa exitosamente)
   */
  async releaseDeposit(depositId: string, notes?: string): Promise<Deposit> {
    const deposit = await this.getDepositById(depositId);

    if (deposit.status === DepositStatus.RELEASED) {
      throw new BadRequestException('Este depósito ya ha sido liberado');
    }

    deposit.status = DepositStatus.RELEASED;
    deposit.notes = notes || `Depósito liberado. Sorteo completado exitosamente.`;
    deposit.updatedAt = new Date();

    const updatedDeposit = await this.depositsRepository.save(deposit);

    // Notificar a la tienda
    await this.notificationService.notifyDepositReleased(deposit);

    return updatedDeposit;
  }

  /**
   * Retiene un depósito (cuando hay problemas con la entrega del premio)
   */
  async holdDeposit(depositId: string, reason: string): Promise<Deposit> {
    const deposit = await this.getDepositById(depositId);

    if (deposit.status === DepositStatus.HELD) {
      throw new BadRequestException('Este depósito ya está retenido');
    }

    deposit.status = DepositStatus.HELD;
    deposit.notes = `Depósito retenido. Razón: ${reason}`;
    deposit.updatedAt = new Date();

    const updatedDeposit = await this.depositsRepository.save(deposit);

    // Notificar a la tienda
    await this.notificationService.notifyDepositHeld(deposit, reason);

    return updatedDeposit;
  }

  /**
   * Ejecuta un depósito (cuando se confirma la entrega del premio)
   */
  async executeDeposit(depositId: string): Promise<Deposit> {
    const deposit = await this.getDepositById(depositId);

    if (deposit.status === DepositStatus.EXECUTED) {
      throw new BadRequestException('Este depósito ya ha sido ejecutado');
    }

    deposit.status = DepositStatus.EXECUTED;
    deposit.notes = `Depósito ejecutado. Premio entregado al ganador.`;
    deposit.updatedAt = new Date();

    const updatedDeposit = await this.depositsRepository.save(deposit);

    // Notificar a la tienda
    await this.notificationService.notifyDepositExecuted(deposit);

    return updatedDeposit;
  }

  /**
   * Obtiene estadísticas de depósitos por tienda
   */
  async getDepositStatistics(shopId: string): Promise<{
    totalDeposits: number;
    totalAmount: number;
    byStatus: {
      pending: number;
      held: number;
      released: number;
      executed: number;
    };
    amountByStatus: {
      pending: number;
      held: number;
      released: number;
      executed: number;
    };
  }> {
    const deposits = await this.getDepositsByShop(shopId);

    const stats = {
      totalDeposits: deposits.length,
      totalAmount: 0,
      byStatus: {
        pending: 0,
        held: 0,
        released: 0,
        executed: 0,
      },
      amountByStatus: {
        pending: 0,
        held: 0,
        released: 0,
        executed: 0,
      },
    };

    deposits.forEach((deposit) => {
      stats.totalAmount += Number(deposit.amount);
      stats.byStatus[deposit.status]++;
      stats.amountByStatus[deposit.status] += Number(deposit.amount);
    });

    return stats;
  }

  /**
   * Obtiene depósitos por rango de fechas
   */
  async getDepositsByDateRange(
    shopId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Deposit[]> {
    return this.depositsRepository
      .createQueryBuilder('deposit')
      .where('deposit.shopId = :shopId', { shopId })
      .andWhere('deposit.createdAt >= :startDate', { startDate })
      .andWhere('deposit.createdAt <= :endDate', { endDate })
      .orderBy('deposit.createdAt', 'DESC')
      .leftJoinAndSelect('deposit.raffle', 'raffle')
      .leftJoinAndSelect('raffle.product', 'product')
      .getMany();
  }
}