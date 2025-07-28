import { IsNumber, IsString } from 'class-validator';

export class CreateHistoryDto {
  @IsNumber()
  notificationId: number;

  @IsString()
  status: string;

  @IsString()
  lastUpdateBy: string;

  @IsString()
  assignedTo: string;
}
