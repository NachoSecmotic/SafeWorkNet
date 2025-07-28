import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateVideoStreamDto } from './dto/create-video-stream.dto';
import { UpdateVideoStreamDto } from './dto/update-video-stream.dto';
import { VideoStreamEntity } from './entities/video-stream.entity';
import { DeviceEntity } from '../devices/entities/device.entity';
import { Status } from './entities/utils';
import { Type } from '../devices/entities/enums';

@Injectable()
export class VideoStreamService {
  constructor(
    @InjectRepository(VideoStreamEntity)
    private videoStreamRepository: Repository<VideoStreamEntity>,
    @InjectRepository(DeviceEntity)
    private deviceRepository: Repository<DeviceEntity>,
  ) {}

  private generateWebRTCUrl(device: DeviceEntity, streamId: number): string {
    // Primero intentamos usar WEBRTC_BASE_URL del entorno
    // Si no está definido, usamos la URL de producción por defecto
    // Solo usamos localhost si explícitamente estamos en desarrollo local
    const baseUrl = process.env.WEBRTC_BASE_URL || 
                   (process.env.NODE_ENV === 'development' ? 'http://localhost:8888' : 'https://webrtc.dev.cvsec.secmotic.com');
    
    // Los dispositivos Mobile Cam y Smartphone requieren procesado
    const requiresProcessing = device.type === Type.VIDEO_CAMERA || device.type === Type.SMARTPHONE;
    const suffix = requiresProcessing ? '/procesado/' : '/';
    
    return `${baseUrl}/app/${streamId}${suffix}`;
  }

  async create(createVideoStreamDto: CreateVideoStreamDto) {
    try {
      const device = await this.deviceRepository.findOneBy({
        id: createVideoStreamDto.deviceId,
      });

      if (!device) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }

      // Creamos una instancia temporal para obtener un ID
      const tempVideoStream = this.videoStreamRepository.create({
        ...createVideoStreamDto,
        device,
        // Establecemos una URL temporal que será actualizada después
        url: 'pending',
      });

      // Guardamos para obtener el ID
      const savedVideoStream = await this.videoStreamRepository.save(tempVideoStream);
      
      // Actualizamos con la URL correcta usando el ID
      savedVideoStream.url = this.generateWebRTCUrl(device, savedVideoStream.id);
      
      // Guardamos de nuevo con la URL correcta
      return this.videoStreamRepository.save(savedVideoStream);
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findAll() {
    try {
      const [videoStreams, total] =
        await this.videoStreamRepository.findAndCount({
          relations: ['device'],
        });

      return {
        data: videoStreams,
        total,
      };
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findByDevice(deviceId: number) {
    try {
      return await this.videoStreamRepository.find({
        where: { status: Status.ACTIVE, device: { id: deviceId } },
        relations: ['device'],
      });
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findByApiKey(apikey: string) {
    try {
      return await this.videoStreamRepository.find({
        where: { status: Status.ACTIVE, device: { apikey } },
        relations: ['device'],
      });
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findByDeviceType(query: Record<string, string>) {
    try {
      const parsedParams: Record<string, any> = {};

      for (const [key, value] of Object.entries(query)) {
        switch (value.toLowerCase()) {
          case 'true':
            parsedParams[key] = true;
            break;
          case 'false':
            parsedParams[key] = false;
            break;
          default:
            parsedParams[key] = value;
            break;
        }
      }

      return await this.videoStreamRepository.find({
        where: { status: Status.ACTIVE, device: { ...parsedParams } },
        relations: ['device'],
      });
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findOne(id: number) {
    try {
      const videoStream = await this.videoStreamRepository.findOne({
        where: { id },
        relations: ['device'],
      });

      if (!videoStream) {
        throw new HttpException('Video Stream not found', HttpStatus.NOT_FOUND);
      }

      return videoStream;
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async update(id: number, updateVideoStreamDto: UpdateVideoStreamDto) {
    try {
      const videoStream = await this.videoStreamRepository.findOneBy({ id });

      if (!videoStream) {
        throw new HttpException('Video Stream not found', HttpStatus.NOT_FOUND);
      }

      if (updateVideoStreamDto.deviceId) {
        const device = await this.deviceRepository.findOneBy({
          id: updateVideoStreamDto.deviceId,
        });

        if (!device) {
          throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
        }

        videoStream.device = device;
      }

      if (updateVideoStreamDto.name || updateVideoStreamDto.deviceId) {
        const device = videoStream.device;
        const streamName = updateVideoStreamDto.name || videoStream.name;
        videoStream.url = this.generateWebRTCUrl(device, videoStream.id);
      }

      return this.videoStreamRepository.save({
        ...videoStream,
        ...updateVideoStreamDto,
      });
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }
  async removeBlock(ids: number[]) {
    try {
      const videoStreams = await this.videoStreamRepository.findBy({
        id: In(ids),
      });

      if (videoStreams.length !== ids.length) {
        throw new HttpException(
          'Some Video Streams not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.videoStreamRepository.remove(videoStreams);
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.code}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async remove(id: number) {
    try {
      const videoStream = await this.videoStreamRepository.findOneBy({ id });

      if (videoStream) {
        await this.videoStreamRepository.remove(videoStream);
      } else {
        throw new HttpException('Video Stream not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findByParams({
    name,
    status,
    deviceId,
    page = 1,
    limit = 10,
    sort = 'id',
    order = 'ASC',
  }: any) {
    try {
      const queryBuilder = this.videoStreamRepository
        .createQueryBuilder('videoStream')
        .leftJoinAndSelect('videoStream.device', 'device');

      if (name) {
        queryBuilder.andWhere('videoStream.name LIKE :name', {
          name: `%${name}%`,
        });
      }

      if (status) {
        queryBuilder.andWhere('videoStream.status = :status', { status });
      }

      if (deviceId) {
        queryBuilder.andWhere('videoStream.device.id = :deviceId', {
          deviceId,
        });
      }

      queryBuilder
        .orderBy(`videoStream.${sort}`, order)
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
}
