import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import {
  getArticle,
  getArticles,
  saveArticle,
  deleteArticle,
  editArticle,
} from "@backend/db/articles";
import { saveSchema, editSchema } from "@backend/routes/schemas/articles";
import { RouteOptionsWithBody } from "@backend/interfaces/helpers";
import { NotFoundError } from "@backend/common";
import { SaveArticle, GetArticle, EditArticle } from "@backend/interfaces/api";

const getArticlesRoute: fastify.RouteOptions = {
  url: "/api/articles",
  method: ["GET"],
  handler: async (_, reply) => {
    const articles = await getArticles();
    return reply.send(articles);
  },
};

const getArticleRoute: fastify.RouteOptions = {
  url: "/api/articles/:articleId",
  method: ["GET"],
  handler: async (request, reply) => {
    const articleId = request.params.articleId;
    let article: GetArticle;
    try {
      article = await getArticle(articleId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        reply.code(404).send({ msg: error.toString() });
      } else {
        throw error;
      }
      return;
    }

    return reply.send(article);
  },
};

const postArticlesRoute: RouteOptionsWithBody<SaveArticle> = {
  url: "/api/articles",
  method: ["POST"],
  schema: { body: saveSchema },
  handler: async (request, reply) => {
    try {
      await saveArticle(request.body);
    } catch (error) {
      reply.code(422).send({ msg: error });
      return;
    }
    reply.code(201).send();
  },
};

const deleteArticleRoute: fastify.RouteOptions = {
  url: "/api/articles/:articleId",
  method: ["DELETE"],
  handler: async (request, reply) => {
    const articleId = request.params.articleId;
    try {
      await deleteArticle(articleId);
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

const putArticlesRoute: RouteOptionsWithBody<EditArticle> = {
  url: "/api/articles:articleId",
  method: ["PUT"],
  schema: { body: editSchema },
  handler: async (request, reply) => {
    const articleId = request.params.articleId;

    try {
      await editArticle(articleId, request.body);
    } catch (error) {
      reply.code(422).send({ msg: error });
      return;
    }
    reply.code(200).send();
  },
};

export default fp(async (server, _, next) => {
  server.route(getArticlesRoute);
  server.route(getArticleRoute);
  server.route(postArticlesRoute);
  server.route(deleteArticleRoute);
  server.route(putArticlesRoute);

  next();
});
