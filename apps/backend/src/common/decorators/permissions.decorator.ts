import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { PermissionsGuard, REQUIRED_PERMISSIONS_KEY } from "../guards/permissions.guard";

export const Permissions = (...permissions: string[]) =>
  applyDecorators(SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions), UseGuards(PermissionsGuard));
