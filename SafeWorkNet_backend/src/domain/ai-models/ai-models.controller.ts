import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { AiModelsService } from './ai-models.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { ApiTags } from '@nestjs/swagger';
import { Resource, Scopes } from 'nest-keycloak-connect';

@ApiTags('AI Models')
@Controller('aiModels')
@Resource('aiModels')
export class AiModelsController {
  constructor(private readonly aiModelsService: AiModelsService) {}

  @Get()
  @Scopes('list')
  findAll(@Query() query: any) {
    if (Object.keys(query).length === 0) {
      return this.aiModelsService.findAll();
    } else {
      return this.aiModelsService.findByParams(query);
    }
  }

  @Get(':id')
  @Scopes('list_mine')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.aiModelsService.findOne(id);
  }

  @Post()
  @Scopes('create')
  create(@Body() createAiModel: CreateAiModelDto) {
    return this.aiModelsService.create(createAiModel);
  }

  @Patch(':id')
  @Scopes('update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAiModel: UpdateAiModelDto,
  ) {
    return this.aiModelsService.update(id, updateAiModel);
  }

  @Delete()
  @Scopes('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBlock(@Body('ids') ids: number[]) {
    return this.aiModelsService.removeBlock(ids);
  }

  @Delete(':id')
  @Scopes('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.aiModelsService.remove(id);
  }
}
