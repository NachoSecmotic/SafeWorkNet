import { NotificationEntity } from 'src/domain/notifications/entities/notifications.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'history' })
export class HistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  notificationId: number;

  @Column()
  status: string;

  @Column()
  lastUpdateBy: string;

  @Column()
  assignedTo: string;

  @CreateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => NotificationEntity, (notification) => notification.history, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notificationId' })
  notification: NotificationEntity;
}
