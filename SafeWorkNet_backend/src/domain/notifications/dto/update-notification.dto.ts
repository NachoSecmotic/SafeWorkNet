import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsString, IsInt, IsOptional, IsDate } from 'class-validator';
import { Status, Type } from '../entities/enums';
import { CreateNotificationDTO } from './create-notification.dto';

export class UpdateNotificationDto extends PartialType(CreateNotificationDTO) {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  videoStreamId: number;

  @IsEnum(Status, { each: true })
  status: Status;

  @IsEnum(Type, { each: true })
  type: Type;

  @IsString()
  triggerLabel: string;

  @IsString()
  lastUpdateBy: string;

  @IsString()
  assignedTo: string;

  @IsOptional()
  @IsString()
  fileName: string;

  @IsDate()
  createdAt: Date;
}
