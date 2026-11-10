import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { Role } from "../../modules/iam/role/entities/role.entity";
import { PermissionService } from "../../modules/iam/permission/permission.service";
import type { AuthUser } from "./jwt-auth.guard";

export const REQUIRED_PERMISSIONS_KEY = "requiredPermissions";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: PermissionService,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;
    if (!request.user?.userId) throw new ForbiddenException("没有访问权限");
    if (await this.isSuperAdmin(request.user.userId)) return true;
    if (!(await this.permissions.hasPermissions(request.user.userId, required))) {
      throw new ForbiddenException("没有访问权限");
    }
    return true;
  }

  private async isSuperAdmin(userId: number) {
    return this.roles.exists({
      where: { isSuper: true, deletedAt: IsNull(), users: { id: userId, deletedAt: IsNull() } },
    });
  }
}
