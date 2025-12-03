import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

export const AuditAction = {
  RAFFLE_APPROVED: 'raffle_approved',
  RAFFLE_REJECTED: 'raffle_rejected',
  RAFFLE_CANCELLED: 'raffle_cancelled',
  RAFFLE_EXECUTED: 'raffle_executed',
  RAFFLE_EXECUTION_FAILED: 'raffle_execution_failed',
  SHOP_STATUS_CHANGED: 'shop_status_changed',
  SHOP_VERIFIED: 'shop_verified',
  SHOP_BLOCKED: 'shop_blocked',
  USER_SUSPENDED: 'user_suspended',
  COMPLAINT_CREATED: 'complaint_created',
  COMPLAINT_UPDATED: 'complaint_updated',
  COMPLAINT_RESOLVED: 'complaint_resolved',
  TICKET_PURCHASED: 'ticket_purchased',
  PAYMENT_PROCESSED: 'payment_processed',
  PRODUCT_CREATED: 'product_created',
  PRODUCT_UPDATED: 'product_updated',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

@Entity('audit_logs')
@Index(['adminId'])
@Index(['action'])
@Index(['createdAt'])
@Index(['entityType'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  adminId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'varchar', length: 50 })
  entityType: string; // 'raffle', 'shop', 'user'

  @Column({ type: 'uuid' })
  entityId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  previousStatus: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  newStatus: string;

  @Column({ type: 'text', nullable: true })
  reason: string; // Para rechazos, bloqueos, etc.

  @Column({ type: 'text', nullable: true })
  details: string; // JSON con detalles adicionales

  @CreateDateColumn()
  createdAt: Date;
}