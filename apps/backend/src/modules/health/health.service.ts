import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  //  =========================健康状态检查=========================
  async check() {
    try {
      await this.dataSource.query("SELECT 1");
      return { status: "ok" };
    } catch {
      throw new ServiceUnavailableException("数据库暂不可用");
    }
  }
}
