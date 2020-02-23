import * as fastify from "fastify";
import * as fastifyBasicAuth from "fastify-basic-auth";

import { validate } from "@backend/auth";
import dummyRoutes from "@backend/routes/dummy";
import clientRoutes from "@backend/routes/clients";

const server = fastify();

server.register(fastifyBasicAuth, { validate, authenticate: { realm: "kfz-werkstatt" } });
server.register(dummyRoutes);
server.register(clientRoutes);

server.after(() => {
  server.addHook("preHandler", server.basicAuth);
});

export default server;
