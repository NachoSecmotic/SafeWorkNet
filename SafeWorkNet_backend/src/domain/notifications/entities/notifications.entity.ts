import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ValueTransformer,
} from 'typeorm';
import { Status, Type } from './enums';
import { VideoStreamEntity } from 'src/domain/video-stream/entities/video-stream.entity';
import { HistoryEntity } from 'src/domain/notifications-history/entitties/history.entity';
import { GeoPoint } from 'src/domain/common/utils';
import { parse, stringify } from 'wkt';

export class PointTransformer implements ValueTransformer {
  to(value: GeoPoint): string | undefined {
    if (value) return stringify(value);
  }

  from(value: string): GeoPoint {
    return parse(value ?? '');
  }
}

@Entity({ name: 'notifications' })
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  videoStreamId: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.UNATTENDED,
  })
  status: Status;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    transformer: new PointTransformer(),
    nullable: true,
  })
  location: GeoPoint;

  @Column({ type: 'enum', enum: Type })
  type: Type;

  @Column()
  triggerLabel: string;

  @Column()
  lastUpdateBy: string;

  @Column()
  assignedTo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: null })
  fileName: string;

  @ManyToOne(
    () => VideoStreamEntity,
    (videoStream) => videoStream.notifications,
    {
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'videoStreamId' })
  videoStream: VideoStreamEntity;

  @OneToMany(() => HistoryEntity, (history) => history.notification)
  history: HistoryEntity[];
}
