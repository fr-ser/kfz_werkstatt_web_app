import server from "@backend/server";
import { _pool } from "@backend/db/db";

import { createArticle } from "@tests/factory/article";
import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";

describe("articles", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  describe("api/articles", () => {
    it("returns the list of articles", async () => {
      await createArticle();
      await createArticle();

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

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/articles",
      });
      expect(response.payload).toEqual(JSON.stringify([article]));
    });
  });

  describe("api/articles/<article_id>", () => {
    it("returns the the article", async () => {
      const article = await createArticle();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/articles/${article.article_id}`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.payload).toEqual(JSON.stringify(article));
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
