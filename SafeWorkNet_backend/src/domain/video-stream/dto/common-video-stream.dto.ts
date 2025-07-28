import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Status, Section } from '../entities/utils';
import { Type } from 'class-transformer';
import { IsPolygon } from './custom-validators/polygon-validator';

export class SectionDto implements Section {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  aiModels: string[];

  @IsPolygon({ message: 'Invalid polygon coordinates.' })
  coordinates: number[][];
}

export class CommonVideoStreamDto {
  @IsString()
  name?: string;

  @IsEnum(Status, { each: true })
  status?: Status;

  @IsArray()
  aiModels?: string[];

  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  screenSections?: SectionDto[];

  @IsOptional()
  @IsInt()
  deviceId?: number;
}
