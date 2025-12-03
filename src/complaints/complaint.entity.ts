import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Shop } from '../shops/shop.entity';
import { Raffle } from '../raffles/raffle.entity';
import { Payment } from '../payments/payment.entity';
import { ComplaintMessage } from './complaint-message.entity';
import { ComplaintAttachment } from './complaint-attachment.entity';

export const ComplaintType = {
  PRIZE_NOT_DELIVERED: 'prize_not_delivered',
  DIFFERENT_PRODUCT: 'different_product',
  PURCHASE_PROBLEM: 'purchase_problem',
  SHOP_BEHAVIOR: 'shop_behavior',
  RAFFLE_FRAUD: 'raffle_fraud',
  TECHNICAL_ISSUE: 'technical_issue',
  PAYMENT_ERROR: 'payment_error',
} as const;

export type ComplaintType = typeof ComplaintType[keyof typeof ComplaintType];

export const ComplaintStatus = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type ComplaintStatus = typeof ComplaintStatus[keyof typeof ComplaintStatus];

export const ComplaintResolution = {
  RESOLVED_USER_FAVOR: 'resolved_user_favor',
  RESOLVED_SHOP_FAVOR: 'resolved_shop_favor',
  RESOLVED_PLATFORM_FAVOR: 'resolved_platform_favor',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type ComplaintResolution = typeof ComplaintResolution[keyof typeof ComplaintResolution];

@Entity('complaints')
@Index(['userId'])
@Index(['shopId'])
@Index(['raffleId'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
@Index(['complaintNumber'])
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  complaintNumber: string; // Número consecutivo único (COMP-001, COMP-002, etc.)

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  shopId: string;

  @ManyToOne(() => Shop, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column({ type: 'uuid', nullable: true })
  raffleId: string;

  @ManyToOne(() => Raffle, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'raffleId' })
  raffle: Raffle;

  @Column({ type: 'uuid', nullable: true })
  paymentId: string;

  @ManyToOne(() => Payment, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column({
    type: 'enum',
    enum: ComplaintType,
  })
  type: ComplaintType;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDING,
  })
  status: ComplaintStatus;

  @Column({
    type: 'enum',
    enum: ComplaintResolution,
    nullable: true,
  })
  resolution: ComplaintResolution;

  @Column({ type: 'uuid', nullable: true })
  assignedAdminId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignedAdminId' })
  assignedAdmin: User;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  maxResponseDate: Date; // Fecha máxima de respuesta (30 días desde creación)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => ComplaintMessage, (message) => message.complaint, { cascade: true })
  messages: ComplaintMessage[];

  @OneToMany(() => ComplaintAttachment, (attachment) => attachment.complaint, { cascade: true })
  attachments: ComplaintAttachment[];
}