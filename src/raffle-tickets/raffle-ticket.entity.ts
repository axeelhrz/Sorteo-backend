import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Raffle } from '../raffles/raffle.entity';
import { User } from '../users/user.entity';

export const RaffleTicketStatus = {
  SOLD: 'sold',
  WINNER: 'winner',
  REFUNDED: 'refunded',
} as const;

export type RaffleTicketStatus = typeof RaffleTicketStatus[keyof typeof RaffleTicketStatus];

@Entity('raffle_tickets')
@Index(['raffleId'])
@Index(['userId'])
@Unique(['raffleId', 'number'])
export class RaffleTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  raffleId: string;

  @ManyToOne(() => Raffle, (raffle) => raffle.tickets, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'raffleId' })
  raffle: Raffle;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'integer' })
  number: number;

  @Column({
    type: 'enum',
    enum: RaffleTicketStatus,
    default: RaffleTicketStatus.SOLD,
  })
  status: RaffleTicketStatus;

  @CreateDateColumn()
  purchasedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  paymentId: string;
}