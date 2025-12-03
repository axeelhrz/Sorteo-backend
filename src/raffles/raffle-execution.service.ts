import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Raffle, RaffleStatus } from './raffle.entity';
import { RaffleTicket } from '../raffle-tickets/raffle-ticket.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit.entity';

@Injectable()
export class RaffleExecutionService {
  private executingRaffles = new Set<string>(); // Mutex en memoria para evitar doble ejecución

  constructor(
    @InjectRepository(Raffle)
    private rafflesRepository: Repository<Raffle>,
    @InjectRepository(RaffleTicket)
    private ticketsRepository: Repository<RaffleTicket>,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  /**
   * Ejecutar sorteo de forma segura con lock transaccional
   * Previene doble ejecución y garantiza consistencia
   */
  async executeRaffleSecurely(raffleId: string, adminId: string): Promise<Raffle> {
    // Verificar si ya está en ejecución (mutex)
    if (this.executingRaffles.has(raffleId)) {
      throw new ConflictException('This raffle is already being executed');
    }

    this.executingRaffles.add(raffleId);

    try {
      // Usar transacción para garantizar consistencia
      return await this.dataSource.transaction(async (manager) => {
        // Obtener sorteo con lock FOR UPDATE
        const raffle = await manager
          .createQueryBuilder(Raffle, 'raffle')
          .where('raffle.id = :id', { id: raffleId })
          .setLock('pessimistic_write')
          .getOne();

        if (!raffle) {
          throw new NotFoundException('Raffle not found');
        }

        // Validar que el sorteo no ha sido ejecutado
        if (raffle.status === RaffleStatus.FINISHED) {
          throw new BadRequestException('This raffle has already been executed');
        }

        // Validar que el sorteo está en estado válido
        if (raffle.status !== RaffleStatus.SOLD_OUT && raffle.status !== RaffleStatus.ACTIVE) {
          throw new BadRequestException(
            `Raffle must be ACTIVE or SOLD_OUT to execute. Current status: ${raffle.status}`,
          );
        }

        // Validar que hay tickets vendidos
        if (raffle.soldTickets === 0) {
          throw new BadRequestException('Cannot execute raffle with no tickets sold');
        }

        // Obtener todos los tickets del sorteo
        const tickets = await manager.find(RaffleTicket, {
          where: { raffleId },
        });

        if (tickets.length === 0) {
          throw new BadRequestException('No tickets found for this raffle');
        }

        // Validar consistencia: cantidad de tickets debe coincidir con soldTickets
        if (tickets.length !== raffle.soldTickets) {
          throw new ConflictException(
            `Ticket count mismatch. Expected ${raffle.soldTickets}, found ${tickets.length}`,
          );
        }

        // Seleccionar ganador aleatoriamente
        const winnerTicket = tickets[Math.floor(Math.random() * tickets.length)];

        // Actualizar sorteo
        raffle.winnerTicketId = winnerTicket.id;
        raffle.status = RaffleStatus.FINISHED;
        raffle.raffleExecutedAt = new Date();

        const updatedRaffle = await manager.save(raffle);

        // Registrar en auditoría
        await this.auditService.log(
          adminId,
          AuditAction.RAFFLE_EXECUTED,
          'Raffle',
          raffleId,
          {
            previousStatus: RaffleStatus.ACTIVE,
            newStatus: RaffleStatus.FINISHED,
            details: {
              winnerTicketId: winnerTicket.id,
              winnerUserId: winnerTicket.userId,
              totalTickets: tickets.length,
              timestamp: new Date().toISOString(),
            },
          },
        );

        return updatedRaffle;
      });
    } finally {
      // Remover del mutex
      this.executingRaffles.delete(raffleId);
    }
  }

  /**
   * Ejecutar automáticamente un sorteo cuando todos los tickets están vendidos
   * Este método se llama automáticamente cuando un sorteo pasa a sold_out
   */
  async autoExecuteWhenSoldOut(raffleId: string): Promise<Raffle | null> {
    try {
      const raffle = await this.rafflesRepository.findOne({
        where: { id: raffleId },
        relations: ['shop', 'product', 'tickets'],
      });

      if (!raffle) {
        throw new NotFoundException('Raffle not found');
      }

      // Validar que el sorteo está en estado sold_out
      if (raffle.status !== RaffleStatus.SOLD_OUT) {
        return null; // No está listo para ejecutarse
      }

      // Validar que ya tiene ganador (no ejecutar dos veces)
      if (raffle.winnerTicketId) {
        return raffle; // Ya fue ejecutado
      }

      // Validar que todos los tickets están vendidos
      if (raffle.soldTickets !== raffle.totalTickets) {
        return null; // Aún no están todos vendidos
      }

      // Ejecutar el sorteo automáticamente (sin adminId, usar sistema)
      const systemAdminId = 'system-auto-execution';
      return await this.executeRaffleSecurely(raffleId, systemAdminId);
    } catch (error) {
      // Log error pero no lanzar excepción para no interrumpir el flujo
      console.error(`Error ejecutando sorteo automáticamente ${raffleId}:`, error);
      return null;
    }
  }

  /**
   * Validar consistencia de tickets antes de ejecutar
   */
  async validateTicketConsistency(raffleId: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const raffle = await this.rafflesRepository.findOne({ where: { id: raffleId } });
    if (!raffle) {
      errors.push('Raffle not found');
      return { valid: false, errors };
    }

    const tickets = await this.ticketsRepository.find({ where: { raffleId } });

    if (tickets.length !== raffle.soldTickets) {
      errors.push(
        `Ticket count mismatch: expected ${raffle.soldTickets}, found ${tickets.length}`,
      );
    }

    // Validar que no hay tickets duplicados
    const ticketIds = new Set(tickets.map(t => t.id));
    if (ticketIds.size !== tickets.length) {
      errors.push('Duplicate tickets found');
    }

    // Validar que todos los tickets tienen usuario
    const ticketsWithoutUser = tickets.filter(t => !t.userId);
    if (ticketsWithoutUser.length > 0) {
      errors.push(`Found ${ticketsWithoutUser.length} tickets without user`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}