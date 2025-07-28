import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiModelsRepositoryService } from './ai-models-repository.service';
import { Resource, Scopes } from 'nest-keycloak-connect';
import { ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

@Controller('aiModelsRepository')
@ApiTags('aiModelsRepository')
@Resource('aiModels')
export class AiModelsRepositoryController {
  constructor(
    private readonly aiModelsRepositoryService: AiModelsRepositoryService,
  ) {}
  @Get()
  @Scopes('list')
  findAll() {
    return this.aiModelsRepositoryService.findAll();
  }

  @Get(':id')
  @Scopes('list_mine')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.aiModelsRepositoryService.findOne(id);
  }

  @Post()
  @Scopes('create')
  @UseInterceptors(
    FileInterceptor('newAImodel', {
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB limit
      },
    }),
  )
  create(@UploadedFile() newAImodel: Express.Multer.File) {
    return this.aiModelsRepositoryService.create(newAImodel);
  }
}
