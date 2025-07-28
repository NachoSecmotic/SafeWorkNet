import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationEntity } from './entities/notifications.entity';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { HistoryService } from 'src/domain/notifications-history/history.service';
import { VideoStreamEntity } from '../video-stream/entities/video-stream.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationsRepository: Repository<NotificationEntity>,
    @InjectRepository(VideoStreamEntity)
    private videoStreamRepository: Repository<VideoStreamEntity>,
    private historyService: HistoryService,
  ) {}

  async create(createNotificationDto: CreateNotificationDTO) {
    try {
      const videoStream = await this.videoStreamRepository.findOne({
        where: { id: createNotificationDto.videoStreamId },
        relations: ['device'],
      });

      if (!videoStream) {
        throw new HttpException('VideoStream not found', HttpStatus.NOT_FOUND);
      }

      const notification = await this.notificationsRepository.create(
        createNotificationDto,
      );

      if (videoStream.device?.location)
        notification.location = videoStream.device?.location;

      return await this.notificationsRepository.save(notification);
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findByParams({
    name,
    page = 1,
    limit = 10,
    sort = 'id',
    order = 'ASC',
  }: any) {
    try {
      const queryBuilder = this.notificationsRepository
        .createQueryBuilder('notification')
        .leftJoinAndSelect('notification.videoStream', 'videoStream');

      if (name) {
        queryBuilder.andWhere('notification.name LIKE :name', {
          name: `%${name}%`,
        });
      }

      queryBuilder
        .orderBy(`notification.${sort}`, order)
        .skip((page - 1) * limit)
        .take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      return { data, total };
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findAll() {
    try {
      const [notifications, total] =
        await this.notificationsRepository.findAndCount();

      return {
        data: notifications,
        total,
      };
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findOne(id: number) {
    try {
      const notificationFound = await this.notificationsRepository.findOneBy({
        id,
      });

      if (!notificationFound) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
      return notificationFound;
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    try {
      const notificationFound = await this.notificationsRepository.findOneBy({
        id,
      });

      if (!notificationFound) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }

      const videoStream = await this.videoStreamRepository.findOne({
        where: { id: updateNotificationDto.videoStreamId },
        relations: ['device'],
      });

      if (!videoStream) {
        throw new HttpException('VideoStream not found', HttpStatus.NOT_FOUND);
      }

      const updatedNotification = await this.notificationsRepository.save({
        ...notificationFound,
        ...updateNotificationDto,
        location: videoStream.device?.location,
      });

      await this.historyService.create({
        notificationId: id,
        status: updatedNotification.status,
        lastUpdateBy: updatedNotification.lastUpdateBy,
        assignedTo: updatedNotification.assignedTo,
      });

      return updatedNotification;
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async remove(id: number) {
    try {
      const notification = await this.notificationsRepository.findOneBy({ id });

      if (notification) {
        await this.notificationsRepository.remove(notification);
      } else {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async removeBlock(ids: number[]) {
    try {
      const notifications = await this.notificationsRepository.findBy({
        id: In(ids),
      });

      if (notifications.length !== ids.length) {
        throw new HttpException('Some devices not found', HttpStatus.NOT_FOUND);
      }

      await this.notificationsRepository.remove(notifications);
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
