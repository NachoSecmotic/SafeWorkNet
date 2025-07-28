import { IsString } from 'class-validator';
import { CommonDeviceDto } from './common-device.dto';

export class CreateDeviceDto extends CommonDeviceDto {
  @IsString()
  name: string;
}
