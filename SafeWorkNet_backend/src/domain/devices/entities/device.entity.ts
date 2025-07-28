import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ValueTransformer,
} from 'typeorm';
import { Resolution, Type } from './enums';
import { VideoStreamEntity } from '../../video-stream/entities/video-stream.entity';
import { Exclude } from 'class-transformer';
import { parse, stringify } from 'wkt';
import { GeoPoint } from 'src/domain/common/utils';

export class PointTransformer implements ValueTransformer {
  to(value: GeoPoint): string | undefined {
    if (value) return stringify(value);
  }

  from(value: string): GeoPoint {
    return parse(value ?? '');
  }
}

@Entity({ name: 'devices' })
export class DeviceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: Type })
  type: Type;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    transformer: new PointTransformer(),
    nullable: true,
  })
  location: GeoPoint;

  @Column({ type: 'json' })
  resolution: Resolution;

  @Column({ unique: true })
  apikey: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => VideoStreamEntity, (videoStream) => videoStream.device)
  videoStreams: VideoStreamEntity[];

  @Column({ default: false, select: false })
  @Exclude()
  isEdge: boolean;

  @Column()
  @Exclude()
  authId: string;

  @Column({ default: false })
  requiresProcessing: boolean;
}
