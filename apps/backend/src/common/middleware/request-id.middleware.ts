import { randomUUID } from "node:crypto";
import type { NodeRequest } from "@nestjs/platform-node";

export const requestIdMiddleware = (
  request: NodeRequest & { id?: string },
  _response: unknown,
  next: () => void,
) => {
  request.id = randomUUID();
  next();
};
