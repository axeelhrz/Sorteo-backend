import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Shop } from '../shops/shop.entity';
import { Raffle } from '../raffles/raffle.entity';

export const ProductStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const;

export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];

@Entity('products')
@Index(['shopId'])
@Index(['status'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  // Dimensiones en centímetros
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  height: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  width: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  depth: number;

  // Depósito de garantía
  @Column({ type: 'boolean', default: false })
  requiresDeposit: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  mainImage: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => Raffle, (raffle) => raffle.product)
  raffles: Raffle[];
}