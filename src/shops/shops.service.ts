import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop, ShopStatus } from './shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { User } from '../users/user.entity';
import { Raffle, RaffleStatus } from '../raffles/raffle.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { RaffleTicket } from '../raffle-tickets/raffle-ticket.entity';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Raffle)
    private rafflesRepository: Repository<Raffle>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(RaffleTicket)
    private ticketsRepository: Repository<RaffleTicket>,
  ) {}

  async create(createShopDto: CreateShopDto): Promise<Shop> {
    // Validar que el usuario existe
    const user = await this.usersRepository.findOne({
      where: { id: createShopDto.userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Validar que el usuario tiene rol 'shop'
    if (user.role !== 'shop') {
      throw new BadRequestException('El usuario debe tener rol shop para crear una tienda');
    }

    // Crear la tienda
    const shop = this.shopsRepository.create({
      ...createShopDto,
      status: ShopStatus.PENDING,
    });

    return this.shopsRepository.save(shop);
  }

  async findAll(): Promise<Shop[]> {
    return this.shopsRepository.find({
      relations: ['user', 'products', 'raffles'],
    });
  }

  async findById(id: string): Promise<Shop> {
    const shop = await this.shopsRepository.findOne({
      where: { id },
      relations: ['user', 'products', 'raffles', 'deposits'],
    });

    if (!shop) {
      throw new NotFoundException('Tienda no encontrada');
    }

    return shop;
  }

  async findByUserId(userId: string): Promise<Shop[]> {
    return this.shopsRepository.find({
      where: { userId },
      relations: ['products', 'raffles'],
    });
  }

  /**
   * Obtiene o crea una tienda para un usuario con rol shop
   * Si no existe, la crea automáticamente usando el nombre del usuario
   */
  async getOrCreateShopForUser(userId: string, userName: string): Promise<Shop> {
    try {
      console.log(`🔍 getOrCreateShopForUser - userId: ${userId}, userName: ${userName}`);
      
      // Buscar si ya existe una tienda
      const existingShops = await this.findByUserId(userId);
      console.log(`📦 Tiendas existentes encontradas: ${existingShops?.length || 0}`);
      
      if (existingShops && existingShops.length > 0) {
        console.log(`✅ Retornando tienda existente: ${existingShops[0].id}`);
        return existingShops[0];
      }

      // Verificar que el usuario existe y tiene rol shop
      console.log(`👤 Buscando usuario: ${userId}`);
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        console.error(`❌ Usuario no encontrado: ${userId}`);
        throw new NotFoundException('Usuario no encontrado');
      }

      console.log(`👤 Usuario encontrado: ${user.id} - ${user.name} - Rol: ${user.role}`);

      if (user.role !== 'shop') {
        console.error(`❌ Usuario no tiene rol shop: ${user.role}`);
        throw new BadRequestException('El usuario debe tener rol shop para tener una tienda');
      }

      // Crear la tienda automáticamente usando el nombre del usuario
      const shopName = userName?.trim() || user.name?.trim() || `Tienda de ${user.email}`;
      console.log(`🏪 Creando tienda con nombre: ${shopName}`);
      
      const shop = this.shopsRepository.create({
        userId: user.id,
        name: shopName,
        status: ShopStatus.PENDING,
      });

      const savedShop = await this.shopsRepository.save(shop);
      console.log(`✅ Tienda creada automáticamente: ${savedShop.id} - ${savedShop.name}`);
      
      return savedShop;
    } catch (error) {
      console.error('❌ Error en getOrCreateShopForUser:', error);
      throw error;
    }
  }

  async findVerified(): Promise<Shop[]> {
    return this.shopsRepository.find({
      where: { status: ShopStatus.VERIFIED },
      relations: ['products', 'raffles'],
    });
  }

  async updateStatus(id: string, status: ShopStatus): Promise<Shop> {
    const shop = await this.findById(id);

    // Validar transiciones de estado
    if (shop.status === ShopStatus.BLOCKED && status !== ShopStatus.BLOCKED) {
      throw new BadRequestException('No se puede cambiar el estado de una tienda bloqueada');
    }

    shop.status = status;
    return this.shopsRepository.save(shop);
  }

  async verify(id: string): Promise<Shop> {
    return this.updateStatus(id, ShopStatus.VERIFIED);
  }

  async block(id: string): Promise<Shop> {
    return this.updateStatus(id, ShopStatus.BLOCKED);
  }

  async update(id: string, updateData: Partial<CreateShopDto>): Promise<Shop> {
    const shop = await this.findById(id);

    Object.assign(shop, updateData);
    return this.shopsRepository.save(shop);
  }

  async delete(id: string): Promise<void> {
    const shop = await this.findById(id);

    // Validar que no tenga sorteos activos
    const activeRaffles = shop.raffles?.filter((r) => r.status === 'active');
    if (activeRaffles && activeRaffles.length > 0) {
      throw new BadRequestException('No se puede eliminar una tienda con sorteos activos');
    }

    await this.shopsRepository.remove(shop);
  }

  /**
   * Obtiene estadísticas completas de una tienda
   */
  async getShopStatistics(shopId: string): Promise<{
    raffles: {
      total: number;
      draft: number;
      pendingApproval: number;
      active: number;
      soldOut: number;
      finished: number;
      cancelled: number;
    };
    tickets: {
      totalSold: number;
      totalAvailable: number;
      thisMonth: number;
    };
    revenue: {
      total: number;
      thisMonth: number;
      completedPayments: number;
    };
    products: {
      total: number;
      active: number;
      withDeposit: number;
    };
    conversionRate: number;
  }> {
    // Estadísticas de sorteos
    const raffles = await this.rafflesRepository.find({
      where: { shopId },
    });

    const raffleStats = {
      total: raffles.length,
      draft: raffles.filter((r) => r.status === RaffleStatus.DRAFT).length,
      pendingApproval: raffles.filter((r) => r.status === RaffleStatus.PENDING_APPROVAL).length,
      active: raffles.filter((r) => r.status === RaffleStatus.ACTIVE).length,
      soldOut: raffles.filter((r) => r.status === RaffleStatus.SOLD_OUT).length,
      finished: raffles.filter((r) => r.status === RaffleStatus.FINISHED).length,
      cancelled: raffles.filter((r) => r.status === RaffleStatus.CANCELLED).length,
    };

    // Estadísticas de tickets
    const allTickets = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.raffle', 'raffle')
      .where('raffle.shopId = :shopId', { shopId })
      .getMany();

    const totalTicketsSold = allTickets.length;
    const totalTicketsAvailable = raffles.reduce((sum, r) => sum + r.totalTickets, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const ticketsThisMonth = allTickets.filter(
      (t) => new Date(t.purchasedAt) >= thisMonth,
    ).length;

    // Estadísticas de ingresos
    const payments = await this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.raffle', 'raffle')
      .where('raffle.shopId = :shopId', { shopId })
      .getMany();

    const completedPayments = payments.filter((p) => p.status === PaymentStatus.COMPLETED);
    const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const paymentsThisMonth = completedPayments.filter(
      (p) => p.completedAt && new Date(p.completedAt) >= thisMonth,
    );
    const revenueThisMonth = paymentsThisMonth.reduce((sum, p) => sum + Number(p.amount), 0);

    // Estadísticas de productos
    const shop = await this.findById(shopId);
    const products = shop.products || [];
    const activeProducts = products.filter((p) => p.status === 'active');
    const productsWithDeposit = products.filter((p) => p.requiresDeposit);

    // Tasa de conversión (tickets vendidos / tickets disponibles)
    const conversionRate =
      totalTicketsAvailable > 0 ? (totalTicketsSold / totalTicketsAvailable) * 100 : 0;

    return {
      raffles: raffleStats,
      tickets: {
        totalSold: totalTicketsSold,
        totalAvailable: totalTicketsAvailable,
        thisMonth: ticketsThisMonth,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: revenueThisMonth,
        completedPayments: completedPayments.length,
      },
      products: {
        total: products.length,
        active: activeProducts.length,
        withDeposit: productsWithDeposit.length,
      },
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }
}