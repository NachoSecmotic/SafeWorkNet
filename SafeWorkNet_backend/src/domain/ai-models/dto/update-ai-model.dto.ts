import { PartialType } from '@nestjs/swagger';
import { CreateAiModelDto } from './create-ai-model.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateAiModelDto extends PartialType(CreateAiModelDto) {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  aiModelRepository: string;

  @IsOptional()
  @IsString()
  uri: string;
}
