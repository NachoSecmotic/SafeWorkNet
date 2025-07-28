import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { VideoStreamService } from './video-stream.service';
import { CreateVideoStreamDto } from './dto/create-video-stream.dto';
import { UpdateVideoStreamDto } from './dto/update-video-stream.dto';
import { ApiTags } from '@nestjs/swagger';
import { Resource, Scopes } from 'nest-keycloak-connect';

@ApiTags('VideoStreams')
@Controller('videoStreams')
@Resource('streams')
export class VideoStreamController {
  constructor(private videoStreamService: VideoStreamService) {}

  @Get()
  @Scopes('list')
  findAll(@Query() query: any) {
    if (Object.keys(query).length === 0) {
      return this.videoStreamService.findAll();
    } else {
      return this.videoStreamService.findByParams(query);
    }
  }

  @Get('device/:deviceId?')
  @Scopes('list_devices')
  findByDevice(
    @Param('deviceId') deviceId: string,
    @Headers('x-api-key') apiKey: string,
    @Query() query: any,
  ) {
    const isEdge = query.isEdge?.toLowerCase() === 'true';

    if (deviceId) {
      return this.videoStreamService.findByDevice(Number.parseInt(deviceId));
    }
    if (isEdge) {
      return this.videoStreamService.findByApiKey(apiKey);
    }

    return this.videoStreamService.findByDeviceType(query);
  }

  @Get(':id')
  @Scopes('list_mine')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.videoStreamService.findOne(id);
  }

  @Post()
  @Scopes('create')
  create(@Body() createVideoStreamDto: CreateVideoStreamDto) {
    return this.videoStreamService.create(createVideoStreamDto);
  }

  @Patch(':id')
  @Scopes('update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVideoStreamDto: UpdateVideoStreamDto,
  ) {
    return this.videoStreamService.update(id, updateVideoStreamDto);
  }

  @Delete()
  @Scopes('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBlock(@Body('ids') ids: number[]) {
    return this.videoStreamService.removeBlock(ids);
  }

  @Delete(':id')
  @Scopes('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.videoStreamService.remove(id);
  }
}
