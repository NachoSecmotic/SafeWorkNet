import { IsString, IsOptional } from 'class-validator';

export class CreateAiModelDto {
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
