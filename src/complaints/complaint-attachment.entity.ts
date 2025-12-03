import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Complaint } from './complaint.entity';
import { User } from '../users/user.entity';

@Entity('complaint_attachments')
@Index(['complaintId'])
@Index(['uploadedBy'])
export class ComplaintAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  complaintId: string;

  @ManyToOne(() => Complaint, (complaint) => complaint.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'complaintId' })
  complaint: Complaint;

  @Column({ type: 'uuid' })
  uploadedBy: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'uploadedBy' })
  uploader: User;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  fileUrl: string; // URL del archivo almacenado

  @Column({ type: 'varchar', length: 50 })
  fileType: string; // 'image', 'pdf', 'document', etc.

  @Column({ type: 'integer' })
  fileSize: number; // Tamaño en bytes

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}