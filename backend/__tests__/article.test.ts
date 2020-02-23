import server from "@backend/server";
import { _pool } from "@backend/db/db";

import { DbArticle } from "@backend/interfaces/db";

import { Fixture } from "@tests/factory/factory";
import { createArticle } from "@tests/factory/article";
import { getAuthHeader } from "@tests/helpers";

describe("articles", () => {
  let factories: Fixture<DbArticle>[] = [];

  beforeAll(async () => {
    await server.ready();
  });

  afterEach(async () => {
    for (const factory of factories) {
      await factory.destroy();
    }
    factories = [];
  });

  describe("api/articles", () => {
    it("returns the list of articles", async () => {
      factories.push(await createArticle());
      factories.push(await createArticle());

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/articles",
      });
      const jsonResp = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(jsonResp.length).toEqual(2);
    });

    it("returns correct article properties", async () => {
      const article = await createArticle();
      factories.push(article);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/articles",
      });
      expect(response.payload).toEqual(JSON.stringify([article.element]));
    });
  });

  describe("api/articles/<article_id>", () => {
    it("returns the the article", async () => {
      const article = await createArticle();
      factories.push(article);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/articles/${article.element.article_id}`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.payload).toEqual(JSON.stringify(article.element));
    });

    it("returns the 404 for non existing articles", async () => {
      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/articles/sth_not_existing`,
      });

      expect(response.statusCode).toEqual(404);
    });
  });
});
