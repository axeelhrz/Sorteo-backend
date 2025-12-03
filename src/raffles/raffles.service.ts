import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Raffle, RaffleStatus } from './raffle.entity';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { Shop, ShopStatus } from '../shops/shop.entity';
import { Product } from '../products/product.entity';
import { Deposit, DepositStatus } from '../deposits/deposit.entity';
import { NotificationEventService } from '../notifications/notification-event.service';

@Injectable()
export class RafflesService {
  private readonly logger = new Logger(RafflesService.name);

  constructor(
    @InjectRepository(Raffle)
    private rafflesRepository: Repository<Raffle>,
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Deposit)
    private depositsRepository: Repository<Deposit>,
    private notificationEventService: NotificationEventService,
  ) {}

  async create(createRaffleDto: CreateRaffleDto): Promise<Raffle> {
    // Validar que la tienda existe y está verificada
    const shop = await this.shopsRepository.findOne({
      where: { id: createRaffleDto.shopId },
    });

    if (!shop) {
      throw new BadRequestException('Tienda no encontrada');
    }

    if (shop.status === ShopStatus.BLOCKED) {
      throw new BadRequestException('La tienda está bloqueada y no puede crear sorteos');
    }

    // Validar que el producto existe
    const product = await this.productsRepository.findOne({
      where: { id: createRaffleDto.productId },
    });

    if (!product) {
      throw new BadRequestException('Producto no encontrado');
    }

    if (product.shopId !== createRaffleDto.shopId) {
      throw new BadRequestException('El producto no pertenece a esta tienda');
    }

    // Calcular total de tickets (valor del producto * 2) si no se proporciona
    let totalTickets = createRaffleDto.totalTickets;
    
    if (!totalTickets) {
      totalTickets = Math.floor(Number(product.value) * 2);
    }

    if (totalTickets < 1) {
      throw new BadRequestException('El sorteo debe tener al menos 1 ticket');
    }

    // Crear el sorteo
    const raffle = this.rafflesRepository.create({
      shopId: createRaffleDto.shopId,
      productId: createRaffleDto.productId,
      productValue: product.value,
      totalTickets,
      soldTickets: 0,
      status: RaffleStatus.DRAFT,
      requiresDeposit: product.requiresDeposit,
      specialConditions: createRaffleDto.specialConditions,
    });

    return this.rafflesRepository.save(raffle);
  }

  async findAll(): Promise<Raffle[]> {
    return this.rafflesRepository.find({
      relations: ['shop', 'product', 'tickets', 'deposits'],
    });
  }

  async findById(id: string): Promise<Raffle> {
    const raffle = await this.rafflesRepository.findOne({
      where: { id },
      relations: ['shop', 'shop.user', 'product', 'tickets', 'deposits'],
    });

    if (!raffle) {
      throw new NotFoundException('Sorteo no encontrado');
    }

    return raffle;
  }

  async findByShopId(shopId: string): Promise<Raffle[]> {
    return this.rafflesRepository.find({
      where: { shopId },
      relations: ['product', 'tickets', 'deposits'],
    });
  }

  async findActive(): Promise<Raffle[]> {
    return this.rafflesRepository.find({
      where: { status: RaffleStatus.ACTIVE },
      relations: ['shop', 'product', 'tickets'],
    });
  }

  async findPublicActive(filters: {
    search?: string;
    category?: string;
    shopId?: string;
    minValue?: number;
    maxValue?: number;
    status?: RaffleStatus;
    sortBy?: 'newest' | 'closest' | 'price-asc' | 'price-desc';
    page?: number;
    limit?: number;
  }): Promise<{ data: Raffle[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryBuilder = this.rafflesRepository
      .createQueryBuilder('raffle')
      .leftJoinAndSelect('raffle.shop', 'shop')
      .leftJoinAndSelect('raffle.product', 'product')
      .leftJoinAndSelect('shop.user', 'user');

    // Filtrar por estado (por defecto solo activos y pausados, excluyendo draft, rejected)
    if (filters.status) {
      queryBuilder.andWhere('raffle.status = :status', { status: filters.status });
    } else {
      queryBuilder.andWhere('raffle.status IN (:...statuses)', {
        statuses: [RaffleStatus.ACTIVE, RaffleStatus.PAUSED, RaffleStatus.SOLD_OUT],
      });
    }

    // Búsqueda por texto (nombre del producto)
    if (filters.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Filtro por categoría
    if (filters.category) {
      queryBuilder.andWhere('product.category = :category', { category: filters.category });
    }

    // Filtro por tienda
    if (filters.shopId) {
      queryBuilder.andWhere('raffle.shopId = :shopId', { shopId: filters.shopId });
    }

    // Filtro por precio mínimo
    if (filters.minValue !== undefined) {
      queryBuilder.andWhere('raffle.productValue >= :minValue', { minValue: filters.minValue });
    }

    // Filtro por precio máximo
    if (filters.maxValue !== undefined) {
      queryBuilder.andWhere('raffle.productValue <= :maxValue', { maxValue: filters.maxValue });
    }

    // Ordenamiento
    switch (filters.sortBy) {
      case 'price-asc':
        queryBuilder.orderBy('raffle.productValue', 'ASC');
        break;
      case 'price-desc':
        queryBuilder.orderBy('raffle.productValue', 'DESC');
        break;
      case 'closest':
        queryBuilder.orderBy('raffle.soldTickets', 'DESC');
        break;
      case 'newest':
      default:
        queryBuilder.orderBy('raffle.createdAt', 'DESC');
        break;
    }

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getCategories(): Promise<string[]> {
    const raffles = await this.rafflesRepository
      .createQueryBuilder('raffle')
      .leftJoinAndSelect('raffle.product', 'product')
      .where('raffle.status IN (:...statuses)', {
        statuses: [RaffleStatus.ACTIVE, RaffleStatus.PAUSED, RaffleStatus.SOLD_OUT],
      })
      .andWhere('product.category IS NOT NULL')
      .select('DISTINCT product.category', 'category')
      .getRawMany();

    return raffles.map((r) => r.category).filter((c) => c);
  }

  async getShopsWithActiveRaffles(): Promise<Array<{ id: string; name: string }>> {
    const shops = await this.shopsRepository
      .createQueryBuilder('shop')
      .innerJoin('shop.raffles', 'raffle')
      .where('raffle.status IN (:...statuses)', {
        statuses: [RaffleStatus.ACTIVE, RaffleStatus.PAUSED, RaffleStatus.SOLD_OUT],
      })
      .andWhere('shop.status = :shopStatus', { shopStatus: ShopStatus.VERIFIED })
      .select(['shop.id', 'shop.name'])
      .distinct(true)
      .getMany();

    return shops.map((shop) => ({ id: shop.id, name: shop.name }));
  }

  async findByStatus(status: RaffleStatus): Promise<Raffle[]> {
    return this.rafflesRepository.find({
      where: { status },
      relations: ['shop', 'product', 'tickets'],
    });
  }

  async submitForApproval(id: string): Promise<Raffle> {
    const raffle = await this.findById(id);

    if (raffle.status !== RaffleStatus.DRAFT) {
      throw new BadRequestException('Solo los sorteos en borrador pueden ser enviados a aprobación');
    }

    raffle.status = RaffleStatus.PENDING_APPROVAL;
    return this.rafflesRepository.save(raffle);
  }

  async approve(id: string): Promise<Raffle> {
    const raffle = await this.findById(id);

    if (raffle.status !== RaffleStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Solo los sorteos pendientes de aprobación pueden ser aprobados');
    }

    // Validar que si requiere depósito, existe un depósito en estado 'held'
    if (raffle.requiresDeposit) {
      const deposit = await this.depositsRepository.findOne({
        where: {
          raffleId: id,
          status: DepositStatus.HELD,
        },
      });

      if (!deposit) {
        throw new BadRequestException(
          'Este sorteo requiere un depósito de garantía en estado "held" antes de ser activado',
        );
      }
    }

    // Activar automáticamente el sorteo cuando se aprueba
    raffle.status = RaffleStatus.ACTIVE;
    raffle.activatedAt = new Date();
    const savedRaffle = await this.rafflesRepository.save(raffle);

    // Notificar a la tienda que el sorteo fue aprobado y activado
    try {
      const shop = await this.shopsRepository.findOne({
        where: { id: raffle.shopId },
        relations: ['user'],
      });

      if (shop) {
        await this.notificationEventService.onRaffleApproved({
          shopId: shop.id,
          shopEmail: shop.publicEmail || shop.user?.email || '',
          shopName: shop.name,
          raffleName: raffle.product?.name || 'Sorteo',
          marketplaceUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sorteos/${savedRaffle.id}`,
        });
      }
    } catch (error) {
      this.logger.error('Error notificando aprobación de sorteo:', error);
      // No lanzar excepción para no interrumpir el flujo de aprobación
    }

    return savedRaffle;
  }

  async reject(id: string): Promise<Raffle> {
    const raffle = await this.findById(id);

    if (raffle.status !== RaffleStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Solo los sorteos pendientes de aprobación pueden ser rechazados');
    }

    raffle.status = RaffleStatus.REJECTED;
    return this.rafflesRepository.save(raffle);
  }

  async incrementSoldTickets(id: string, quantity: number): Promise<Raffle> {
    const raffle = await this.findById(id);

    if (raffle.status !== RaffleStatus.ACTIVE) {
      throw new BadRequestException('Solo se pueden vender tickets de sorteos activos');
    }

    const newSoldTickets = raffle.soldTickets + quantity;

    if (newSoldTickets > raffle.totalTickets) {
      throw new BadRequestException(
        `No se pueden vender más de ${raffle.totalTickets - raffle.soldTickets} tickets`,
      );
    }

    raffle.soldTickets = newSoldTickets;

    // Si se vendieron todos los tickets, cambiar estado a sold_out
    if (raffle.soldTickets === raffle.totalTickets) {
      raffle.status = RaffleStatus.SOLD_OUT;
    }

    return this.rafflesRepository.save(raffle);
  }

  async executeRaffle(id: string, winnerTicketId: string): Promise<Raffle> {
    const raffle = await this.findById(id);

    if (raffle.status !== RaffleStatus.SOLD_OUT && raffle.status !== RaffleStatus.ACTIVE) {
      throw new BadRequestException('El sorteo debe estar vendido o activo para ejecutarse');
    }

    raffle.winnerTicketId = winnerTicketId;
    raffle.status = RaffleStatus.FINISHED;
    raffle.raffleExecutedAt = new Date();

    return this.rafflesRepository.save(raffle);
  }

  async cancel(id: string): Promise<Raffle> {
    const raffle = await this.findById(id);

    if (raffle.status === RaffleStatus.FINISHED) {
      throw new BadRequestException('No se puede cancelar un sorteo ya finalizado');
    }

    raffle.status = RaffleStatus.CANCELLED;
    return this.rafflesRepository.save(raffle);
  }

  async update(id: string, updateData: Partial<CreateRaffleDto>): Promise<Raffle> {
    const raffle = await this.findById(id);

    if (raffle.status !== RaffleStatus.DRAFT) {
      throw new BadRequestException('Solo se pueden editar sorteos en estado borrador');
    }

    Object.assign(raffle, updateData);
    return this.rafflesRepository.save(raffle);
  }

  async delete(id: string): Promise<void> {
    const raffle = await this.findById(id);

    if (raffle.soldTickets > 0) {
      throw new BadRequestException('No se puede eliminar un sorteo que tiene tickets vendidos');
    }

    await this.rafflesRepository.remove(raffle);
  }

  /**
   * Pausar un sorteo activo
   */
  async pause(id: string): Promise<Raffle> {
    const raffle = await this.findById(id);

    if (raffle.status !== RaffleStatus.ACTIVE) {
      throw new BadRequestException('Solo se pueden pausar sorteos activos');
    }

    if (raffle.soldTickets > 0) {
      throw new BadRequestException('No se puede pausar un sorteo que ya tiene tickets vendidos');
    }

    raffle.status = RaffleStatus.PAUSED;
    return this.rafflesRepository.save(raffle);
  }

  /**
   * Reanudar un sorteo pausado
   */
  async resume(id: string): Promise<Raffle> {
    const raffle = await this.findById(id);

    if (raffle.status !== RaffleStatus.PAUSED) {
      throw new BadRequestException('Solo se pueden reanudar sorteos pausados');
    }

    raffle.status = RaffleStatus.ACTIVE;
    return this.rafflesRepository.save(raffle);
  }
}