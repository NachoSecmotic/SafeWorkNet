import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryEntity } from './entitties/history.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(HistoryEntity)
    private historyRepository: Repository<HistoryEntity>,
  ) {}

  async create(history: Partial<HistoryEntity>): Promise<HistoryEntity> {
    const newHistory = this.historyRepository.create(history);
    return this.historyRepository.save(newHistory);
  }

  async findByNotificationId(notificationId: number): Promise<HistoryEntity[]> {
    return this.historyRepository.find({
      where: { notificationId },
      order: { updatedAt: 'DESC' },
    });
  }
}
