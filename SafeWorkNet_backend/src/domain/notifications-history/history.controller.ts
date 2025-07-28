import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryEntity } from './entitties/history.entity';
import { CreateHistoryDto } from './dto/create-history.dto';
import { ApiTags } from '@nestjs/swagger';
import { Resource, Scopes } from 'nest-keycloak-connect';

@ApiTags('history')
@Controller('history')
@Resource('history')
export class HistoryController {
  constructor(private readonly updateHistoryService: HistoryService) {}

  @Post()
  @Scopes('create')
  create(
    @Body() createUpdateHistoryDto: CreateHistoryDto,
  ): Promise<HistoryEntity> {
    return this.updateHistoryService.create(createUpdateHistoryDto);
  }

  @Get(':notificationId')
  @Scopes('list_mine')
  findByNotificationId(
    @Param('notificationId') notificationId: number,
  ): Promise<HistoryEntity[]> {
    return this.updateHistoryService.findByNotificationId(notificationId);
  }
}
