import * as http from "http";

export interface Mapping {
  [k: string]: any;
}

import * as fastify from "fastify";

export type RouteOptionsWithBody<T> = fastify.RouteOptions<
  http.Server,
  http.IncomingMessage,
  http.ServerResponse,
  Mapping,
  Mapping,
  Mapping,
  T
>;
