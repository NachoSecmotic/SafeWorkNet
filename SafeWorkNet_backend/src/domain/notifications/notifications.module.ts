import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notifications.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { HistoryModule } from 'src/domain/notifications-history/history.module';
import { VideoStreamEntity } from '../video-stream/entities/video-stream.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, VideoStreamEntity]),
    HistoryModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
