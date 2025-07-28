import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { DeviceEntity } from './entities/device.entity';
import { KeycloakService } from 'src/services/keycloak/keycloak.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEntity])],
  controllers: [DeviceController],
  providers: [DeviceService, KeycloakService],
})
export class DeviceModule {}
