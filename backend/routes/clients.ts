import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { getClients } from "../db/clients";

const getClientsRoute: fastify.RouteOptions = {
  url: "/api/clients",
  method: ["GET"],
  handler: async (request, reply) => {
    const clients = await getClients();
    return reply.send(clients.rows);
  },
};

export default fp(async (server, opts, next) => {
  server.route(getClientsRoute);
  next();
});
