import * as Ajv from "ajv";
import * as fastify from "fastify";
import * as fastifyBasicAuth from "fastify-basic-auth";

import { validate } from "@backend/auth";
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

server.after(() => {
  server.addHook("preHandler", server.basicAuth);
});

export default server;
