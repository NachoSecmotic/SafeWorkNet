import { Injectable } from '@nestjs/common';
import { MinioService } from 'src/services/minio/minio.service';
import { Readable } from 'stream';

@Injectable()
export class AiModelsRepositoryService {
  private readonly bucket: string;

  constructor(private readonly minioService: MinioService) {
    this.bucket = process.env.MINIO_BUCKET;
  }

  async findAll() {
    return this.minioService.listObjects(this.bucket);
  }

  findOne(id: number) {
    return `This action returns a #${id} aiModelsRepository`;
  }

  async create(file: Express.Multer.File) {
    const stream = Readable.from(file.buffer);

    return this.minioService.uploadStream(
      this.bucket,
      `/uploads/${file.originalname}`,
      stream,
      file.size,
      file.mimetype,
    );
  }
}
