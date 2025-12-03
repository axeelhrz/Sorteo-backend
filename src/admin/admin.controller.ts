import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ShopStatus } from '../shops/shop.entity';
import { UserRole } from '../users/user.entity';
import { PaymentStatus } from '../payments/payment.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AuditService,
  ) {}

  // ============ DASHBOARD ============
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ============ RAFFLES ============
  @Get('raffles/pending')
  async getPendingRaffles(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.adminService.getPendingRaffles(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('raffles/active')
  async getActiveRaffles(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('shopId') shopId?: string,
  ) {
    const [data, total] = await this.adminService.getActiveRaffles(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
      shopId ? { shopId } : undefined,
    );
    return { data, total };
  }

  @Get('raffles/finished')
  async getFinishedRaffles(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('shopId') shopId?: string,
  ) {
    const [data, total] = await this.adminService.getFinishedRaffles(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
      shopId ? { shopId } : undefined,
    );
    return { data, total };
  }

  @Get('raffles/:id')
  async getRaffleDetail(@Param('id') id: string) {
    return this.adminService.getRaffleDetail(id);
  }

  @Put('raffles/:id/approve')
  async approveRaffle(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.adminService.approveRaffle(id, user.id);
  }

  @Put('raffles/:id/reject')
  async rejectRaffle(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: any,
  ) {
    if (!body.reason || body.reason.trim().length === 0) {
      throw new BadRequestException('El motivo del rechazo es requerido');
    }
    return this.adminService.rejectRaffle(id, user.id, body.reason);
  }

  @Put('raffles/:id/cancel')
  async cancelRaffle(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: any,
  ) {
    if (!body.reason || body.reason.trim().length === 0) {
      throw new BadRequestException('El motivo de la cancelación es requerido');
    }
    return this.adminService.cancelRaffle(id, user.id, body.reason);
  }

  @Put('raffles/:id/execute')
  async executeRaffle(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.adminService.executeRaffle(id, user.id);
  }

  // ============ SHOPS ============
  @Get('shops')
  async getAllShops(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: ShopStatus,
  ) {
    const [data, total] = await this.adminService.getAllShops(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
      status ? { status } : undefined,
    );
    return { data, total };
  }

  @Get('shops/:id')
  async getShopDetail(@Param('id') id: string) {
    return this.adminService.getShopDetail(id);
  }

  @Put('shops/:id/status')
  async changeShopStatus(
    @Param('id') id: string,
    @Body() body: { status: ShopStatus; reason?: string },
    @CurrentUser() user: any,
  ) {
    if (!body.status) {
      throw new BadRequestException('El estado es requerido');
    }
    return this.adminService.changeShopStatus(id, body.status, user.id, body.reason);
  }

  // ============ USERS ============
  @Get('users')
  async getAllUsers(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('role') role?: UserRole,
  ) {
    const [data, total] = await this.adminService.getAllUsers(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
      role ? { role } : undefined,
    );
    return { data, total };
  }

  @Get('users/:id')
  async getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  // ============ AUDIT ============
  @Get('audit/logs')
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const [data, total] = await this.auditService.findAll({
      action: action as any,
      entityType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
    return { data, total };
  }

  @Get('audit/entity/:entityType/:entityId')
  async getEntityAuditLogs(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(entityType, entityId);
  }

  // ============ PAYMENTS ============
  @Get('payments')
  async getAllPayments(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: PaymentStatus,
    @Query('userId') userId?: string,
    @Query('raffleId') raffleId?: string,
  ) {
    const [data, total] = await this.adminService.getAllPayments(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
      {
        status,
        userId,
        raffleId,
      },
    );
    return { data, total };
  }

  @Get('payments/:id')
  async getPaymentDetail(@Param('id') id: string) {
    return this.adminService.getPaymentDetail(id);
  }
}