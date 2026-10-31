import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { PermissionsGuard } from "../guards/permissions.guard";

const REQUIRED_PERMISSIONS_KEY = "requiredPermissions";

export const Permissions = (...permissions: string[]) =>
  applyDecorators(SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions), UseGuards(PermissionsGuard));
