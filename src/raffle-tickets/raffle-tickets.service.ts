import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaffleTicket, RaffleTicketStatus } from './raffle-ticket.entity';
import { CreateRaffleTicketDto } from './dto/create-raffle-ticket.dto';
import { Raffle, RaffleStatus } from '../raffles/raffle.entity';
import { User } from '../users/user.entity';
import { RaffleExecutionService } from '../raffles/raffle-execution.service';
import { NotificationEventService } from '../notifications/notification-event.service';

@Injectable()
export class RaffleTicketsService {
  private readonly logger = new Logger(RaffleTicketsService.name);

  constructor(
    @InjectRepository(RaffleTicket)
    private ticketsRepository: Repository<RaffleTicket>,
    @InjectRepository(Raffle)
    private rafflesRepository: Repository<Raffle>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => RaffleExecutionService))
    private raffleExecutionService: RaffleExecutionService,
    private notificationEventService: NotificationEventService,
  ) {}

  async create(createRaffleTicketDto: CreateRaffleTicketDto): Promise<RaffleTicket[]> {
    // Validar que el sorteo existe con relaciones
    const raffle = await this.rafflesRepository.findOne({
      where: { id: createRaffleTicketDto.raffleId },
      relations: ['shop', 'shop.user', 'product'],
    });

    if (!raffle) {
      throw new BadRequestException('Sorteo no encontrado');
    }

    // Validar que el usuario existe
    const user = await this.usersRepository.findOne({
      where: { id: createRaffleTicketDto.userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Validar cantidad de tickets
    if (createRaffleTicketDto.quantity < 1) {
      throw new BadRequestException('La cantidad de tickets debe ser mayor a 0');
    }

    // Validar que hay tickets disponibles
    const availableTickets = raffle.totalTickets - raffle.soldTickets;
    if (createRaffleTicketDto.quantity > availableTickets) {
      throw new BadRequestException(
        `Solo hay ${availableTickets} tickets disponibles`,
      );
    }

    // Obtener el próximo número de ticket
    const lastTicket = await this.ticketsRepository.findOne({
      where: { raffleId: createRaffleTicketDto.raffleId },
      order: { number: 'DESC' },
    });

    let nextNumber = 1;
    if (lastTicket) {
      nextNumber = lastTicket.number + 1;
    }

    // Crear los tickets
    const tickets: RaffleTicket[] = [];
    for (let i = 0; i < createRaffleTicketDto.quantity; i++) {
      const ticket = this.ticketsRepository.create({
        raffleId: createRaffleTicketDto.raffleId,
        userId: createRaffleTicketDto.userId,
        number: nextNumber + i,
        status: RaffleTicketStatus.SOLD,
        paymentId: createRaffleTicketDto.paymentId,
      });
      tickets.push(ticket);
    }

    // Guardar todos los tickets
    const savedTickets = await this.ticketsRepository.save(tickets);

    // Actualizar el contador de tickets vendidos en el sorteo
    raffle.soldTickets += createRaffleTicketDto.quantity;
    const wasSoldOut = raffle.soldTickets === raffle.totalTickets;
    
    if (wasSoldOut) {
      raffle.status = RaffleStatus.SOLD_OUT;
    }
    
    const updatedRaffle = await this.rafflesRepository.save(raffle);

    // Si se vendieron todos los tickets, ejecutar automáticamente el sorteo
    if (wasSoldOut) {
      this.logger.log(`Todos los tickets vendidos para sorteo ${raffle.id}. Ejecutando automáticamente...`);
      
      // Notificar que el sorteo se agotó (antes de ejecutarlo)
      try {
        // Recargar el sorteo con relaciones para obtener información completa
        const raffleWithRelations = await this.rafflesRepository.findOne({
          where: { id: raffle.id },
          relations: ['shop', 'shop.user', 'product'],
        });

        if (raffleWithRelations) {
          await this.notificationEventService.onRaffleSoldOut({
            raffleId: raffleWithRelations.id,
            raffleName: raffleWithRelations.product?.name || 'Sorteo',
            shopId: raffleWithRelations.shopId,
            shopEmail: raffleWithRelations.shop?.publicEmail || raffleWithRelations.shop?.user?.email || '',
            shopName: raffleWithRelations.shop?.name || 'Tienda',
          });
        }
      } catch (error) {
        this.logger.error('Error notificando que el sorteo se agotó:', error);
      }

      // Ejecutar automáticamente el sorteo
      try {
        const executedRaffle = await this.raffleExecutionService.autoExecuteWhenSoldOut(raffle.id);
        if (executedRaffle && executedRaffle.winnerTicketId) {
          this.logger.log(`Sorteo ${raffle.id} ejecutado automáticamente. Ganador: ${executedRaffle.winnerTicketId}`);
          
          // Obtener información del ganador para notificaciones
          const winnerTicket = await this.ticketsRepository.findOne({
            where: { id: executedRaffle.winnerTicketId },
            relations: ['user', 'raffle', 'raffle.product', 'raffle.shop', 'raffle.shop.user'],
          });

          if (winnerTicket && winnerTicket.user && winnerTicket.raffle) {
            // Notificar al ganador
            try {
              await this.notificationEventService.onRaffleExecutedWinner({
                winnerId: winnerTicket.user.id,
                winnerEmail: winnerTicket.user.email,
                winnerName: winnerTicket.user.name,
                raffleName: winnerTicket.raffle.product?.name || 'Sorteo',
                shopName: winnerTicket.raffle.shop?.name || 'Tienda',
                shopEmail: winnerTicket.raffle.shop?.publicEmail || winnerTicket.raffle.shop?.user?.email || '',
                shopPhone: winnerTicket.raffle.shop?.phone || undefined,
                ticketNumber: winnerTicket.number,
                raffleUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sorteos/${winnerTicket.raffle.id}`,
              });
            } catch (error) {
              this.logger.error('Error notificando al ganador:', error);
            }

            // Notificar a la tienda
            try {
              await this.notificationEventService.onRaffleExecutedShop({
                shopId: winnerTicket.raffle.shopId,
                shopEmail: winnerTicket.raffle.shop?.publicEmail || winnerTicket.raffle.shop?.user?.email || '',
                shopName: winnerTicket.raffle.shop?.name || 'Tienda',
                raffleName: winnerTicket.raffle.product?.name || 'Sorteo',
                winnerName: winnerTicket.user.name,
                winnerEmail: winnerTicket.user.email,
                ticketNumber: winnerTicket.number,
                shopDashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
              });
            } catch (error) {
              this.logger.error('Error notificando a la tienda:', error);
            }
          }
        }
      } catch (error) {
        this.logger.error(`Error ejecutando sorteo automáticamente ${raffle.id}:`, error);
        // No lanzar excepción para no interrumpir el flujo de creación de tickets
      }
    }

    return savedTickets;
  }

  async findAll(): Promise<RaffleTicket[]> {
    return this.ticketsRepository.find({
      relations: ['raffle', 'user'],
    });
  }

  async findById(id: string): Promise<RaffleTicket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['raffle', 'user'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    return ticket;
  }

  async findByRaffleId(raffleId: string): Promise<RaffleTicket[]> {
    return this.ticketsRepository.find({
      where: { raffleId },
      relations: ['user'],
      order: { number: 'ASC' },
    });
  }

  async findByUserId(userId: string): Promise<RaffleTicket[]> {
    return this.ticketsRepository.find({
      where: { userId },
      relations: ['raffle'],
      order: { purchasedAt: 'DESC' },
    });
  }

  async findByUserAndRaffle(userId: string, raffleId: string): Promise<RaffleTicket[]> {
    return this.ticketsRepository.find({
      where: { userId, raffleId },
      order: { number: 'ASC' },
    });
  }

  async markAsWinner(id: string): Promise<RaffleTicket> {
    const ticket = await this.findById(id);

    if (ticket.status !== RaffleTicketStatus.SOLD) {
      throw new BadRequestException('Solo se pueden marcar como ganador tickets vendidos');
    }

    ticket.status = RaffleTicketStatus.WINNER;
    return this.ticketsRepository.save(ticket);
  }

  async refund(id: string): Promise<RaffleTicket> {
    const ticket = await this.findById(id);

    if (ticket.status === RaffleTicketStatus.WINNER) {
      throw new BadRequestException('No se puede reembolsar un ticket ganador');
    }

    ticket.status = RaffleTicketStatus.REFUNDED;
    return this.ticketsRepository.save(ticket);
  }

  async countByRaffleId(raffleId: string): Promise<number> {
    return this.ticketsRepository.count({
      where: { raffleId, status: RaffleTicketStatus.SOLD },
    });
  }

  async countWinnersByRaffleId(raffleId: string): Promise<number> {
    return this.ticketsRepository.count({
      where: { raffleId, status: RaffleTicketStatus.WINNER },
    });
  }

  async delete(id: string): Promise<void> {
    const ticket = await this.findById(id);

    if (ticket.status === RaffleTicketStatus.WINNER) {
      throw new BadRequestException('No se puede eliminar un ticket ganador');
    }

    await this.ticketsRepository.remove(ticket);
  }
}