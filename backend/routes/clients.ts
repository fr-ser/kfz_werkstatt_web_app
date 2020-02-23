import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { getClients, saveClient } from "@backend/db/clients";
import { bodyJsonSchema } from "@backend/routes/schemas/clients";
import { DbClient } from "@backend/interfaces/db";
import { RouteOptionsWithBody } from "@backend/interfaces/helpers";

const getClientsRoute: fastify.RouteOptions = {
  url: "/api/clients",
  method: ["GET"],
  handler: async (_, reply) => {
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

const postClientsRoute: RouteOptionsWithBody<DbClient> = {
  url: "/api/clients",
  method: ["POST"],
  schema: {
    body: bodyJsonSchema,
  },
  handler: async (request, reply) => {
    try {
      await saveClient(request.body);
    } catch (error) {
      reply.code(422).send({ msg: error });
      return;
    }
    reply.code(201).send();
  },
};

export default fp(async (server, opts, next) => {
  server.route(getClientsRoute);
  server.route(getClientRoute);
  server.route(postClientsRoute);

  next();
});
