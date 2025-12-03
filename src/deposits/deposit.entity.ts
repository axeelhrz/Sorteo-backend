import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Shop } from '../shops/shop.entity';
import { Raffle } from '../raffles/raffle.entity';

export const DepositStatus = {
  PENDING: 'pending',
  HELD: 'held',
  RELEASED: 'released',
  EXECUTED: 'executed',
} as const;

export type DepositStatus = typeof DepositStatus[keyof typeof DepositStatus];

@Entity('deposits')
@Index(['shopId'])
@Index(['raffleId'])
@Index(['status'])
export class Deposit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.deposits, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column({ type: 'uuid', nullable: true })
  raffleId: string;

  @ManyToOne(() => Raffle, (raffle) => raffle.deposits, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'raffleId' })
  raffle: Raffle;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: DepositStatus,
    default: DepositStatus.PENDING,
  })
  status: DepositStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  paymentId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;
}