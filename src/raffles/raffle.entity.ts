import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Shop } from '../shops/shop.entity';
import { Product } from '../products/product.entity';
import { RaffleTicket } from '../raffle-tickets/raffle-ticket.entity';
import { Deposit } from '../deposits/deposit.entity';

export const RaffleStatus = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE: 'active',
  PAUSED: 'paused',
  SOLD_OUT: 'sold_out',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const;

export type RaffleStatus = typeof RaffleStatus[keyof typeof RaffleStatus];

@Entity('raffles')
@Index(['shopId'])
@Index(['productId'])
@Index(['status'])
export class Raffle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.raffles, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.raffles, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  productValue: number;

  @Column({ type: 'integer' })
  totalTickets: number;

  @Column({ type: 'integer', default: 0 })
  soldTickets: number;

  @Column({
    type: 'enum',
    enum: RaffleStatus,
    default: RaffleStatus.DRAFT,
  })
  status: RaffleStatus;

  @Column({ type: 'boolean', default: false })
  requiresDeposit: boolean;

  @Column({ type: 'uuid', nullable: true })
  winnerTicketId: string;

  @Column({ type: 'text', nullable: true })
  specialConditions: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  activatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  raffleExecutedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  drawnBy: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  drawTrigger: 'automatic' | 'manual';

  @Column({ type: 'integer', nullable: true })
  totalValidTickets: number;

  // Relaciones
  @OneToMany(() => RaffleTicket, (ticket) => ticket.raffle)
  tickets: RaffleTicket[];

  @OneToMany(() => Deposit, (deposit) => deposit.raffle)
  deposits: Deposit[];
}