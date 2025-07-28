import configuration from './config/configuration';
import { Logger, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoStreamModule } from './domain/video-stream/video-stream.module';
import { AiModelsModule } from './domain/ai-models/ai-models.module';
import { AiModelsRepositoryModule } from './domain/ai-models-repository/ai-models-repository.module';
import { KeycloakConfigService } from './config/keycloak-config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsModule } from './domain/notifications/notifications.module';
import { HistoryModule } from './domain/notifications-history/history.module';
import { AuthGuard } from './config/api-key.guard';
import { DeviceModule } from './domain/devices/device.module';
import { MinioModule } from './services/minio/minio.module';
import { KeycloakModule } from './services/keycloak/keycloak.module';
import { KeycloakConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('mysql'),
    }),
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakConfigService,
      imports: [KeycloakConfigModule],
    }),
    VideoStreamModule,
    AiModelsModule,
    AiModelsRepositoryModule,
    NotificationsModule,
    HistoryModule,
    DeviceModule,
    MinioModule,
    KeycloakModule,
  ],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
