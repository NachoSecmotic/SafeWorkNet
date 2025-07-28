import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Query,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { ApiTags } from '@nestjs/swagger';
import { Resource, Scopes } from 'nest-keycloak-connect';

@ApiTags('Devices')
@Controller('devices')
@Resource('devices')
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  @Get()
  @Scopes('list')
  findAll(@Query() query: any) {
    if (Object.keys(query).length === 0) {
      return this.deviceService.findAll();
    } else {
      return this.deviceService.findByParams(query);
    }
  }

  @Get('find')
  @Scopes('list_mine')
  findOneByApiKey(@Headers('x-api-key') apiKey: string) {
    return this.deviceService.findByApiKey(apiKey);
  }

  @Get(':id')
  @Scopes('list_mine')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deviceService.findOne(id);
  }

  @Post()
  @Scopes('create')
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.deviceService.create(createDeviceDto);
  }

  @Patch(':id')
  @Scopes('update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.deviceService.update(id, updateDeviceDto);
  }

  @Delete()
  @Scopes('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBlock(@Body('ids') ids: number[]) {
    return this.deviceService.removeBlock(ids);
  }

  @Delete(':id')
  @Scopes('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deviceService.remove(id);
  }
}
