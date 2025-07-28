import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceEntity } from './entities/device.entity';
import { KeycloakService } from 'src/services/keycloak/keycloak.service';
import { Type } from './entities/enums';
import { GeoPoint } from '../common/utils';
import { isNil } from 'lodash';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(DeviceEntity)
    private deviceRepository: Repository<DeviceEntity>,
    private readonly keycloakService: KeycloakService,
  ) {}

  async create(createDeviceDto: CreateDeviceDto) {
    try {
      const deviceFound = await this.deviceRepository.findOneBy({
        name: createDeviceDto.name,
      });

      if (deviceFound) {
        throw new HttpException('Device found', HttpStatus.CONFLICT);
      }

      const keyCloakdevice = await this.keycloakService.createUser(
        createDeviceDto.name,
      );

      const [apikey] = keyCloakdevice.attributes['api-key'];

      let location;

      if (
        !isNil(createDeviceDto.location?.latitude) &&
        !isNil(createDeviceDto.location?.longitude)
      ) {
        const { longitude, latitude } = createDeviceDto.location;
        location = new GeoPoint(longitude, latitude);
      }

      const device = this.deviceRepository.create({
        ...createDeviceDto,
        location,
        apikey,
        isEdge: createDeviceDto.type === Type.EDGE_DEVICE,
        authId: keyCloakdevice.id,
      });

      return await this.deviceRepository.save(device);
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findAll() {
    try {
      const [devices, total] = await this.deviceRepository.findAndCount();

      return {
        data: devices,
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
      const deviceFound = await this.deviceRepository.findOneBy({ id });

      if (!deviceFound) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }
      return deviceFound;
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findByApiKey(apikey: string) {
    try {
      return await this.deviceRepository.findOneBy({
        apikey,
      });
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    try {
      const deviceFound = await this.deviceRepository.findOneBy({ id });

      if (!deviceFound) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }

      await this.keycloakService.updateUser(
        deviceFound.authId,
        updateDeviceDto.name,
      );

      let location = deviceFound.location;

      if (
        !isNil(updateDeviceDto.location?.latitude) &&
        !isNil(updateDeviceDto.location?.longitude)
      ) {
        const { longitude, latitude } = updateDeviceDto.location;
        location = new GeoPoint(longitude, latitude);
      }

      return this.deviceRepository.save({
        ...deviceFound,
        ...updateDeviceDto,
        isEdge: updateDeviceDto.type === Type.EDGE_DEVICE,
        location,
      });
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async remove(id: number) {
    try {
      const device = await this.deviceRepository.findOneBy({ id });

      if (device) {
        this.keycloakService.deleteUser(device.authId);

        await this.deviceRepository.remove(device);
      } else {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
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
      const devices = await this.deviceRepository.findBy({ id: In(ids) });

      if (devices.length !== ids.length) {
        throw new HttpException('Some devices not found', HttpStatus.NOT_FOUND);
      }

      for (const device of devices) {
        await this.keycloakService.deleteUser(device.authId);
        await this.deviceRepository.remove(device);
      }
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.code}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findByParams({
    name,
    type,
    page = 1,
    limit = 10,
    sort = 'id',
    order = 'ASC',
  }: any) {
    try {
      const queryBuilder = this.deviceRepository.createQueryBuilder('device');

      if (name) {
        queryBuilder.andWhere('device.name LIKE :name', {
          name: `%${name}%`,
        });
      }

      if (type) {
        queryBuilder.andWhere('device.type = :type', { type });
      }

      queryBuilder
        .orderBy(`device.${sort}`, order)
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
