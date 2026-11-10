import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthUser } from "../guards/jwt-auth.guard";

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
  return request.user;
});
