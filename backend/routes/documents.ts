import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { getDocument, getDocuments, saveDocument, deleteDocument } from "@backend/db/documents";
import { saveSchema } from "@backend/routes/schemas/documents";
import { RouteOptionsWithBody } from "@backend/interfaces/helpers";
import { NotFoundError } from "@backend/common";
import { SaveDocument, GetDocument } from "@backend/interfaces/api";

const getDocumentsRoute: fastify.RouteOptions = {
  url: "/api/documents",
  method: ["GET"],
  handler: async (_, reply) => {
    const documents = await getDocuments();
    return reply.send(documents);
  },
};

const getDocumentRoute: fastify.RouteOptions = {
  url: "/api/documents/:documentId",
  method: ["GET"],
  handler: async (request, reply) => {
    const documentId = request.params.documentId;
    let document: GetDocument;
    try {
      document = await getDocument(documentId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        reply.code(404).send({ msg: error.toString() });
      } else {
        throw error;
      }
      return;
    }

    return reply.send(document);
  },
};

const postDocumentsRoute: RouteOptionsWithBody<SaveDocument> = {
  url: "/api/documents",
  method: ["POST"],
  schema: { body: saveSchema },
  handler: async (request, reply) => {
    try {
      await saveDocument(request.body);
    } catch (error) {
      reply.code(422).send({ msg: error });
      return;
    }
    reply.code(201).send();
  },
};

const deleteDocumentRoute: fastify.RouteOptions = {
  url: "/api/documents/:documentId",
  method: ["DELETE"],
  handler: async (request, reply) => {
    const documentId = request.params.documentId;
    try {
      await deleteDocument(documentId);
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

export default fp(async (server, _, next) => {
  server.route(getDocumentsRoute);
  server.route(getDocumentRoute);
  server.route(postDocumentsRoute);
  server.route(deleteDocumentRoute);

  next();
});
