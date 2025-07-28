import { IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CommonDeviceDto } from './common-device.dto';

export class UpdateDeviceDto extends PartialType(CommonDeviceDto) {
  @IsOptional()
  @IsString()
  name?: string;
}
