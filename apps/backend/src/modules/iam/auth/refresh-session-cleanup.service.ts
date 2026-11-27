import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { RefreshSession } from "./entities/refresh-session.entity";

@Injectable()
export class RefreshSessionCleanupService {
  private readonly logger = new Logger(RefreshSessionCleanupService.name);

  constructor(
    @InjectRepository(RefreshSession)
    private readonly refreshSessionRepository: Repository<RefreshSession>,
  ) {}

  // =========================清理过期会话=========================
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async removeExpired() {
    try {
      const { affected } = await this.refreshSessionRepository.delete({
        expiresAt: LessThan(new Date()),
      });

      if (affected) {
        this.logger.log(`已清理过期会话 ${affected} 条`);
      }
    } catch (error) {
      this.logger.error("清理过期会话失败", error instanceof Error ? error.stack : String(error));
    }
  }
}
