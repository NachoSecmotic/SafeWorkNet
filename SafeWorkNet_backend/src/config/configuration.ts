import { VideoStreamEntity } from '../domain/video-stream/entities/video-stream.entity';
import { AiModelEntity } from '../domain/ai-models/entities/ai-model.entity';
import { NotificationEntity } from '../domain/notifications/entities/notifications.entity';
import { HistoryEntity } from '../domain/notifications-history/entitties/history.entity';
import { DeviceEntity } from '../domain/devices/entities/device.entity';

export default () => ({
  mysql: {
    type: 'mysql',
    host: process.env.MYSQL_HOST || 'mySQL',
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    database: process.env.MYSQL_DATABASE || 'cvsec',
    username: process.env.MYSQL_USER || 'cvsec-user',
    password: process.env.MYSQL_PASSWORD || 'cvsec-password.!963',
    synchronize: true,
    autoLoadEntities: true,
    legacySpatialSupport: false,
    logging: false,
    entities: [
      VideoStreamEntity,
      AiModelEntity,
      NotificationEntity,
      HistoryEntity,
      DeviceEntity,
    ],
  },
});
