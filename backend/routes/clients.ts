import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { getClients } from "@backend/db/clients";

const getClientsRoute: fastify.RouteOptions = {
  url: "/api/clients",
  method: ["GET"],
  handler: async (request, reply) => {
    const clients = await getClients();
    return reply.send(clients);
  },
};

const getClientRoute: fastify.RouteOptions = {
  url: "/api/clients/:clientId",
  method: ["GET"],
  handler: async (request, reply) => {
    const clientId = request.params.clientId;
    const client = await getClients(clientId);

    if (client) return reply.send(client);
    else reply.code(404).send({ "msg:": `no client found for ${clientId}` });
  },
};
export default fp(async (server, opts, next) => {
  server.route(getClientsRoute);
  server.route(getClientRoute);
  next();
});
