import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { AiModelEntity } from './entities/ai-model.entity';
import { AiModelsFiltered } from './entities/enums';

const BUCKET = 'models/';

@Injectable()
export class AiModelsService {
  constructor(
    @InjectRepository(AiModelEntity)
    private aiModelsRepository: Repository<AiModelEntity>,
  ) {}

  async create(createAiModel: CreateAiModelDto): Promise<AiModelEntity> {
    try {
      const aiModelFound = await this.aiModelsRepository.findOneBy({
        name: createAiModel.name,
      });

      if (aiModelFound) {
        throw new ConflictException(
          `AI Model found with the name '${createAiModel.name}'`,
        );
      }

      const aiModelWithURI = { ...createAiModel };
      aiModelWithURI.uri = `${BUCKET}${createAiModel.aiModelRepository}`;

      return await this.aiModelsRepository.save(aiModelWithURI);
    } catch (error) {
      if (error.status === 409) {
        throw error;
      }
      throw new HttpException(
        `Internal Error - ${error.code}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findAll() {
    try {
      const [aiModels, total] = await this.aiModelsRepository.findAndCount();

      return {
        data: aiModels,
        total,
      };
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.code}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findByParams(query): Promise<AiModelsFiltered> {
    try {
      const { name, page, limit, sort, order } = query;
      const sortDefault = sort ?? 'id';
      const orderDefault = order ?? 'ASC';

      const [data, total] = await Promise.all([
        this.aiModelsRepository
          .createQueryBuilder('aiModels')
          .where('aiModels.name LIKE :name', { name: `%${name}%` })
          .orderBy(`aiModels.${sortDefault}`, orderDefault)
          .skip((page - 1) * limit)
          .take(limit)
          .getMany(),
        this.aiModelsRepository
          .createQueryBuilder('aiModels')
          .where('aiModels.name LIKE :name', { name: `%${name}%` })
          .getCount(),
      ]);
      return { data, total };
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.code}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findOne(id: number): Promise<AiModelEntity> {
    try {
      const aiModelFound = await this.aiModelsRepository.findOneBy({ id });

      return aiModelFound;
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.code}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async update(id: number, updateAiModelDto: UpdateAiModelDto) {
    try {
      const aiModelFound = await this.aiModelsRepository.findOneBy({ id });

      if (!aiModelFound) {
        throw new NotFoundException(`AI Model with ID ${id} not found`);
      }

      return this.aiModelsRepository.save({
        ...aiModelFound,
        ...updateAiModelDto,
        uri: `${BUCKET}${updateAiModelDto.aiModelRepository}`,
      });
    } catch (error) {
      if (error.status === 404) {
        throw error;
      }
      throw new HttpException(
        `Internal Error - ${error.code}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async removeBlock(ids: number[]) {
    try {
      const aiModels = await this.aiModelsRepository.findBy({ id: In(ids) });

      if (aiModels.length !== ids.length) {
        throw new HttpException(
          'Some AI Models not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.aiModelsRepository.remove(aiModels);
    } catch (error) {
      throw new HttpException(
        `Internal Error - ${error.code}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async remove(id: number) {
    try {
      const aiModelDeleted = await this.aiModelsRepository.delete({
        id,
      });

      if (!aiModelDeleted.affected) {
        throw new NotFoundException(`AI Model with ID ${id} not found`);
      }
      return aiModelDeleted;
    } catch (error) {
      if (error.status === 404) {
        throw error;
      }
      throw new HttpException(
        `Internal Error - ${error.code}`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
