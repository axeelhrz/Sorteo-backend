import { Controller, Get, Post, Put, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateDepositStatusDto } from './dto/create-deposit.dto';

@Controller('api/deposits')
@UseGuards(JwtAuthGuard)
export class DepositsController {
  constructor(private depositsService: DepositsService) {}

  /**
   * Obtiene todos los depósitos de la tienda del usuario
   */
  @Get()
  async getMyDeposits(@Request() req) {
    return this.depositsService.getDepositsByShop(req.user.shopId);
  }

  /**
   * Obtiene depósitos por estado
   */
  @Get('by-status/:status')
  async getDepositsByStatus(
    @Request() req,
    @Param('status') status: string,
  ) {
    return this.depositsService.getDepositsByStatus(req.user.shopId, status as any);
  }

  /**
   * Obtiene un depósito específico
   */
  @Get(':id')
  async getDeposit(@Param('id') id: string) {
    return this.depositsService.getDepositById(id);
  }

  /**
   * Obtiene estadísticas de depósitos
   */
  @Get('stats/overview')
  async getDepositStats(@Request() req) {
    return this.depositsService.getDepositStatistics(req.user.shopId);
  }

  /**
   * Obtiene depósitos por rango de fechas
   */
  @Get('range/by-date')
  async getDepositsByDateRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.depositsService.getDepositsByDateRange(
      req.user.shopId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Libera un depósito (solo admin)
   */
  @Put(':id/release')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async releaseDeposit(
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ) {
    return this.depositsService.releaseDeposit(id, body.notes);
  }

  /**
   * Retiene un depósito (solo admin)
   */
  @Put(':id/hold')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async holdDeposit(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.depositsService.holdDeposit(id, body.reason);
  }

  /**
   * Ejecuta un depósito (solo admin)
   */
  @Put(':id/execute')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async executeDeposit(@Param('id') id: string) {
    return this.depositsService.executeDeposit(id);
  }
}