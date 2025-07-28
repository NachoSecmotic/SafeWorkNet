import { Module } from '@nestjs/common';
import { AiModelsRepositoryService } from './ai-models-repository.service';
import { AiModelsRepositoryController } from './ai-models-repository.controller';
import { MinioService } from 'src/services/minio/minio.service';

@Module({
  controllers: [AiModelsRepositoryController],
  providers: [AiModelsRepositoryService, MinioService],
})
export class AiModelsRepositoryModule {}
