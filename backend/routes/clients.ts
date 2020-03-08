import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { getClient, getClients, saveClient, deleteClient, editClient } from "@backend/db/clients";
import { saveSchema, editSchema } from "@backend/routes/schemas/clients";
import { RouteOptionsWithBody } from "@backend/interfaces/helpers";
import { NotFoundError } from "@backend/common";
import { SaveClient, GetClient, EditClient } from "@backend/interfaces/api";

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
    let client: GetClient;
    try {
      client = await getClient(clientId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        reply.code(404).send({ msg: error.toString() });
      } else {
        throw error;
      }
      return;
    }

    return reply.send(client);
  },
};

const postClientsRoute: RouteOptionsWithBody<SaveClient> = {
  url: "/api/clients",
  method: ["POST"],
  schema: { body: saveSchema },
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

const deleteClientRoute: fastify.RouteOptions = {
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

const putClientsRoute: RouteOptionsWithBody<EditClient> = {
  url: "/api/clients:clientId",
  method: ["PUT"],
  schema: { body: editSchema },
  handler: async (request, reply) => {
    const clientId = request.params.clientId;

    try {
      await editClient(clientId, request.body);
    } catch (error) {
      reply.code(422).send({ msg: error });
      return;
    }
    reply.code(200).send();
  },
};

export default fp(async (server, opts, next) => {
  server.route(getClientsRoute);
  server.route(getClientRoute);
  server.route(postClientsRoute);
  server.route(deleteClientRoute);
  server.route(putClientsRoute);

  next();
});
