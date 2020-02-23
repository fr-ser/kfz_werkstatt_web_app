import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { getDocuments } from "@backend/db/documents";

const getDocumentsRoute: fastify.RouteOptions = {
  url: "/api/documents",
  method: ["GET"],
  handler: async (request, reply) => {
    const documents = await getDocuments();
    return reply.send(documents);
  },
};

const getArticleRoute: fastify.RouteOptions = {
  url: "/api/documents/:documentId",
  method: ["GET"],
  handler: async (request, reply) => {
    const documentId = request.params.documentId;
    const document = await getDocuments(documentId);

    if (document) return reply.send(document);
    else reply.code(404).send({ "msg:": `no document found for ${documentId}` });
  },
};
export default fp(async (server, opts, next) => {
  server.route(getDocumentsRoute);
  server.route(getArticleRoute);
  next();
});
