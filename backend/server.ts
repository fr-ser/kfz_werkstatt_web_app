import * as Ajv from "ajv";
import * as fastify from "fastify";
import * as fastifyBasicAuth from "fastify-basic-auth";

import { validate } from "@backend/auth";
import { _pool } from "@backend/db/db";
import clientRoutes from "@backend/routes/clients";
import carRoutes from "@backend/routes/cars";
import articleRoutes from "@backend/routes/articles";
import orderRoutes from "@backend/routes/orders";
import documentRoutes from "@backend/routes/documents";

const server = fastify();

// custom validator to allow `additionalProperties`
const ajv = new Ajv({
  useDefaults: true,
  coerceTypes: true,
  allErrors: true,
  nullable: true,
});
server.setSchemaCompiler(schema => ajv.compile(schema));

server.register(fastifyBasicAuth, { validate, authenticate: { realm: "kfz-werkstatt" } });

server.register(clientRoutes);
server.register(carRoutes);
server.register(articleRoutes);
server.register(orderRoutes);
server.register(documentRoutes);

server.route({
  url: "/api/health",
  method: ["GET"],
  handler: async (request, reply) => {
    try {
      await _pool.query("SELECT 1;");
    } catch (error) {
      reply.code(500).send({ msg: error });
      return;
    }
    reply.code(200).send("All good.");
  },
});

server.after(() => {
  server.addHook("preHandler", server.basicAuth);
});

export default server;
