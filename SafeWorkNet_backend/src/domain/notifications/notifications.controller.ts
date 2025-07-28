import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';
import { Resource, Scopes } from 'nest-keycloak-connect';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
@Resource('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @Scopes('list')
  findAll(@Query() query: any) {
    if (Object.keys(query).length === 0) {
      return this.notificationsService.findAll();
    } else {
      return this.notificationsService.findByParams(query);
    }
  }

  @Get(':id')
  @Scopes('list_mine')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.findOne(id);
  }

  @Post()
  @Scopes('create')
  create(@Body() createNotification: CreateNotificationDTO) {
    return this.notificationsService.create(createNotification);
  }

  @Patch(':id')
  @Scopes('update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotification: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, updateNotification);
  }

  @Delete()
  @Scopes('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBlock(@Body('ids') ids: number[]) {
    return this.notificationsService.removeBlock(ids);
  }

  @Delete(':id')
  @Scopes('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }
}
