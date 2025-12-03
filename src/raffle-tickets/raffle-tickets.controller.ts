import { Controller, Get, Post, Body, Param, Put, UseGuards, Query, Request } from '@nestjs/common';
import { RaffleTicketsService } from './raffle-tickets.service';
import { CreateRaffleTicketDto } from './dto/create-raffle-ticket.dto';
import { RaffleTicket } from './raffle-ticket.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/raffle-tickets')
export class RaffleTicketsController {
  constructor(private readonly ticketsService: RaffleTicketsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createTicketDto: CreateRaffleTicketDto): Promise<RaffleTicket[]> {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req: any,
    @Query('raffleId') raffleId?: string,
    @Query('userId') userId?: string,
  ): Promise<RaffleTicket[]> {
    // Si hay raffleId, obtener tickets del usuario autenticado para ese sorteo
    if (raffleId) {
      const authenticatedUserId = req.user?.id;
      if (authenticatedUserId) {
        return this.ticketsService.findByUserAndRaffle(authenticatedUserId, raffleId);
      }
      // Si no está autenticado pero hay raffleId, devolver todos los tickets del sorteo (público)
      return this.ticketsService.findByRaffleId(raffleId);
    }
    // Si hay userId, usar el autenticado
    const authenticatedUserId = req.user?.id || userId;
    if (authenticatedUserId) {
      return this.ticketsService.findByUserId(authenticatedUserId);
    }
    return this.ticketsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RaffleTicket> {
    return this.ticketsService.findById(id);
  }

  @Get('raffle/:raffleId')
  async findByRaffle(@Param('raffleId') raffleId: string): Promise<RaffleTicket[]> {
    return this.ticketsService.findByRaffleId(raffleId);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string): Promise<RaffleTicket[]> {
    return this.ticketsService.findByUserId(userId);
  }

  @Put(':id/mark-winner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async markAsWinner(@Param('id') id: string): Promise<RaffleTicket> {
    return this.ticketsService.markAsWinner(id);
  }

  @Put(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async refund(@Param('id') id: string): Promise<RaffleTicket> {
    return this.ticketsService.refund(id);
  }
}