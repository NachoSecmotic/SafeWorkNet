import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { Status, Section } from './utils';
import { DeviceEntity } from '../../devices/entities/device.entity';
import { NotificationEntity } from 'src/domain/notifications/entities/notifications.entity';

@Entity({ name: 'videoStreams' })
export class VideoStreamEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.INACTIVE,
  })
  status: Status;

  @Column('simple-array', { nullable: true })
  aiModels: string[];

  @Column()
  url: string;

  @Column('json')
  screenSections: Section[];

  @BeforeInsert()
  setDefaults() {
    if (!this.screenSections) {
      this.screenSections = [];
    }
  }

  @Column({ nullable: true })
  deviceId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => DeviceEntity, (device) => device.videoStreams, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'deviceId' })
  device: DeviceEntity;

  @OneToMany(
    () => NotificationEntity,
    (notification) => notification.videoStream,
  )
  notifications: NotificationEntity[];
}
