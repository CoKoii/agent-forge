import { Controller, Get } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  //  =========================健康检查接口=========================
  @Public()
  @Get()
  check() {
    return this.healthService.check();
  }
}
