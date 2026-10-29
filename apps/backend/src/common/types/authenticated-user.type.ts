import type { FastifyRequest } from "fastify";

export type AuthenticatedUser = {
  sub: number;
  sid: number;
};

export type AuthenticatedRequest = FastifyRequest & {
  user?: AuthenticatedUser;
};
