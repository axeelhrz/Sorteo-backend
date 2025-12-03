import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('notification_preferences')
@Unique(['userId'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Notificaciones obligatorias (no se pueden desactivar)
  // - Ganaste un sorteo
  // - Cambios de estado de cuenta/tienda
  // - Cambios de estado de sorteo críticos

  // Notificaciones opcionales
  @Column({ type: 'boolean', default: true })
  emailPurchaseConfirmation: boolean;

  @Column({ type: 'boolean', default: true })
  emailRaffleResult: boolean;

  @Column({ type: 'boolean', default: true })
  emailRaffleStatusChange: boolean;

  @Column({ type: 'boolean', default: true })
  emailShopStatusChange: boolean;

  @Column({ type: 'boolean', default: true })
  emailPromotions: boolean;

  @Column({ type: 'boolean', default: true })
  inAppNotifications: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}