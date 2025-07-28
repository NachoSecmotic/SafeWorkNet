import {
  IsEnum,
  ValidateNested,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from '../entities/enums';

export class CoordinatesDto {
  @IsOptional()
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  latitude: number;
}

export class ResolutionDto {
  @IsInt()
  height: number;

  @IsInt()
  width: number;
}

export class CommonDeviceDto {
  @IsEnum(Type, { each: true })
  type?: Type;

  @IsOptional()
  @ValidateNested()
  location?: CoordinatesDto;

  @ValidateNested()
  resolution?: ResolutionDto;
}
