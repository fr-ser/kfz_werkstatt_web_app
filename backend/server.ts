import * as fastify from "fastify";
import * as fastifyBasicAuth from "fastify-basic-auth";

import { validate } from "./auth";
import dummyRoutes from "./routes/dummy";

const server = fastify();

server.register(fastifyBasicAuth, { validate, authenticate: { realm: "kfz-werkstatt" } });
server.register(dummyRoutes);

server.after(() => {
  server.addHook("preHandler", server.basicAuth);
});

export default server;
