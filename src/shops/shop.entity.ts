import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Raffle } from '../raffles/raffle.entity';
import { Deposit } from '../deposits/deposit.entity';

export const ShopStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  BLOCKED: 'blocked',
} as const;

export type ShopStatus = typeof ShopStatus[keyof typeof ShopStatus];

@Entity('shops')
@Index(['userId'])
@Index(['status'])
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  publicEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  socialMedia: string;

  @Column({
    type: 'enum',
    enum: ShopStatus,
    default: ShopStatus.PENDING,
  })
  status: ShopStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => Product, (product) => product.shop)
  products: Product[];

  @OneToMany(() => Raffle, (raffle) => raffle.shop)
  raffles: Raffle[];

  @OneToMany(() => Deposit, (deposit) => deposit.shop)
  deposits: Deposit[];
}