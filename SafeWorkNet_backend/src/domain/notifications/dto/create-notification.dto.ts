import { IsEnum, IsString, IsInt, IsOptional } from 'class-validator';
import { Status, Type } from '../entities/enums';

export class CreateNotificationDTO {
  @IsString()
  name: string;

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
}
