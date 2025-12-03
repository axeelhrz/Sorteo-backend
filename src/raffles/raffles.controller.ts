import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { Raffle } from './raffle.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller('api/raffles')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) {}

  // Rutas públicas específicas deben ir ANTES de todas las demás rutas
  @Get('public/active')
  async findPublicActive(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('shopId') shopId?: string,
    @Query('minValue') minValue?: string,
    @Query('maxValue') maxValue?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.rafflesService.findPublicActive({
      search,
      category,
      shopId,
      minValue: minValue ? parseFloat(minValue) : undefined,
      maxValue: maxValue ? parseFloat(maxValue) : undefined,
      status: status as any,
      sortBy: sortBy as any,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
    });
  }

  @Get('public/categories')
  async getPublicCategories(): Promise<string[]> {
    return this.rafflesService.getCategories();
  }

  @Get('public/shops')
  async getPublicShops(): Promise<any[]> {
    return this.rafflesService.getShopsWithActiveRaffles();
  }

  @Get('public/shop/:shopId')
  async getPublicRafflesByShop(
    @Param('shopId') shopId: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.rafflesService.findPublicActive({
      shopId,
      search,
      sortBy: sortBy as any,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
    });
  }

  @Get('public/:id')
  async findPublicOne(@Param('id') id: string): Promise<Raffle> {
    return this.rafflesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  async create(@Body() body: any): Promise<Raffle> {
    // Crear instancia del DTO con todos los campos, incluyendo totalTickets
    const createRaffleDto = plainToInstance(CreateRaffleDto, body);
    
    // Validar el DTO
    const errors = await validate(createRaffleDto, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });
    
    if (errors.length > 0) {
      const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
      throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
    }
    
    return this.rafflesService.create(createRaffleDto);
  }

  @Get()
  async findAll(
    @Query('shopId') shopId?: string,
  ): Promise<Raffle[]> {
    if (shopId) {
      return this.rafflesService.findByShopId(shopId);
    }
    return this.rafflesService.findAll();
  }

  @Get('active')
  async findActive(): Promise<Raffle[]> {
    return this.rafflesService.findActive();
  }

  @Get('shop/my-raffles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop')
  async getMyRaffles(): Promise<Raffle[]> {
    // This endpoint will be called with the shop ID from the frontend
    // The frontend should pass the shopId as a query parameter
    return [];
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Raffle> {
    return this.rafflesService.findById(id);
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approve(@Param('id') id: string): Promise<Raffle> {
    return this.rafflesService.approve(id);
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reject(@Param('id') id: string): Promise<Raffle> {
    return this.rafflesService.reject(id);
  }

  @Put(':id/submit-approval')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  async submitForApproval(@Param('id') id: string): Promise<Raffle> {
    return this.rafflesService.submitForApproval(id);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  async cancel(@Param('id') id: string): Promise<Raffle> {
    return this.rafflesService.cancel(id);
  }

  @Put(':id/pause')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  async pause(@Param('id') id: string): Promise<Raffle> {
    return this.rafflesService.pause(id);
  }

  @Put(':id/resume')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  async resume(@Param('id') id: string): Promise<Raffle> {
    return this.rafflesService.resume(id);
  }

  @Put(':id/execute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async executeRaffle(
    @Param('id') id: string,
    @Body() body: { winnerTicketId: string },
  ): Promise<Raffle> {
    return this.rafflesService.executeRaffle(id, body.winnerTicketId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<void> {
    return this.rafflesService.delete(id);
  }
}