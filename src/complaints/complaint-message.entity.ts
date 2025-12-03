import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Complaint } from './complaint.entity';

export const MessageSender = {
  USER: 'user',
  ADMIN: 'admin',
  SHOP: 'shop',
} as const;

export type MessageSender = typeof MessageSender[keyof typeof MessageSender];

@Entity('complaint_messages')
@Index(['complaintId'])
@Index(['createdAt'])
export class ComplaintMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  complaintId: string;

  @ManyToOne(() => Complaint, (complaint) => complaint.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'complaintId' })
  complaint: Complaint;

  @Column({ type: 'uuid' })
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({
    type: 'enum',
    enum: MessageSender,
  })
  senderType: MessageSender;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}