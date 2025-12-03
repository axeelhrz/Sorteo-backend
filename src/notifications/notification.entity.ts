import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

export const NotificationType = {
  PURCHASE_CONFIRMED: 'purchase_confirmed',
  PURCHASE_FAILED: 'purchase_failed',
  RAFFLE_RESULT_WINNER: 'raffle_result_winner',
  RAFFLE_RESULT_LOSER: 'raffle_result_loser',
  RAFFLE_APPROVED: 'raffle_approved',
  RAFFLE_REJECTED: 'raffle_rejected',
  RAFFLE_CANCELLED: 'raffle_cancelled',
  RAFFLE_PENDING_APPROVAL: 'raffle_pending_approval',
  RAFFLE_SOLD_OUT: 'raffle_sold_out',
  SHOP_VERIFIED: 'shop_verified',
  SHOP_BLOCKED: 'shop_blocked',
  ADMIN_ACTION: 'admin_action',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

@Entity('notifications')
@Index(['userId'])
@Index(['isRead'])
@Index(['createdAt'])
@Index(['type'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  actionUrl: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON con datos adicionales (raffleId, ticketNumber, etc.)

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;
}