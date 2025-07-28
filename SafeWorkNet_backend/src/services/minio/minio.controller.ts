import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MinioService } from './minio.service';
import { Resource, Scopes } from 'nest-keycloak-connect';

@Controller('minio')
@Resource('storage')
export class MinioController {
  private readonly logger = new Logger(MinioController.name);

  constructor(private readonly minioService: MinioService) {}

  @Get('videourl')
  @Scopes('presignedURL')
  async getVideoUrl(@Query('fileName') fileName: string, @Res() res) {
    try {
      const url = await this.minioService.getPresignedUrl(
        'notifications',
        `videos/${fileName}`,
        24 * 60 * 60,
      );
      res.status(HttpStatus.OK).json({ url });
    } catch (error) {
      this.logger.error(
        `Error fetching the video URL: ${error.message}`,
        error.stack,
      );
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: `Error fetching the video URL: ${error.message}` });
    }
  }
}
