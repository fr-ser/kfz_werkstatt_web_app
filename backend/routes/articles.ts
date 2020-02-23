import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { getArticles } from "@backend/db/articles";

const getArticlesRoute: fastify.RouteOptions = {
  url: "/api/articles",
  method: ["GET"],
  handler: async (request, reply) => {
    const articles = await getArticles();
    return reply.send(articles);
  },
};

const getArticleRoute: fastify.RouteOptions = {
  url: "/api/articles/:articleId",
  method: ["GET"],
  handler: async (request, reply) => {
    const articleId = request.params.articleId;
    const article = await getArticles(articleId);

    if (article) return reply.send(article);
    else reply.code(404).send({ "msg:": `no article found for ${articleId}` });
  },
};
export default fp(async (server, opts, next) => {
  server.route(getArticlesRoute);
  server.route(getArticleRoute);
  next();
});
