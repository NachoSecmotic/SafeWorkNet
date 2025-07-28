import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoStreamService } from './video-stream.service';
import { VideoStreamController } from './video-stream.controller';
import { VideoStreamEntity } from './entities/video-stream.entity';
import { DeviceEntity } from '../devices/entities/device.entity';
import { DeviceModule } from '../devices/device.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoStreamEntity, DeviceEntity]),
    DeviceModule,
  ],
  controllers: [VideoStreamController],
  providers: [VideoStreamService],
})
export class VideoStreamModule {}
