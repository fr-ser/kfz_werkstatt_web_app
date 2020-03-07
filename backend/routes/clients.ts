import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { getClient, getClients, saveClient, deleteClient } from "@backend/db/clients";
import { bodyJsonSchema } from "@backend/routes/schemas/clients";
import { DbClient } from "@backend/interfaces/db";
import { RouteOptionsWithBody } from "@backend/interfaces/helpers";
import { NotFoundError } from "@backend/common";
import { ApiClient } from "@backend/interfaces/api";

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
    let client: ApiClient;
    try {
      client = await getClient(clientId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        reply.code(404).send({ msg: error.toString() });
      } else {
        reply.code(500).send({ msg: error.toString() });
      }
      return;
    }

    return reply.send(client);
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

const deleteClientRoute: RouteOptionsWithBody<DbClient> = {
  url: "/api/clients/:clientId",
  method: ["DELETE"],
  handler: async (request, reply) => {
    const clientId = request.params.clientId;
    try {
      await deleteClient(clientId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        reply.code(404).send({ msg: error.toString() });
      } else {
        reply.code(409).send({ msg: error.toString() });
      }
      return;
    }

    reply.send({ "msg:": `deleted` });
  },
};

export default fp(async (server, opts, next) => {
  server.route(getClientsRoute);
  server.route(getClientRoute);
  server.route(postClientsRoute);
  server.route(deleteClientRoute);

  next();
});
