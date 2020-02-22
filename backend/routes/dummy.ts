import * as fp from "fastify-plugin";

export default fp(async (server, opts, next) => {
  server.route({
    url: "/",
    method: ["GET"],
    handler: async (request, reply) => {
      return reply.send({ date: new Date(), works: true });
    },
  });
  next();
});
