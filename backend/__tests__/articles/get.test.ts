import server from "@backend/server";

import { createArticle } from "@tests/factory/article";
import { db_cleanup } from "@tests/factory/factory";
import { getAuthHeader } from "@tests/helpers";
import { GetArticle } from "@backend/interfaces/api";

describe("articles - GET", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  describe("article list", () => {
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
      const dbArticle = await createArticle();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/articles",
      });

      expect(response.statusCode).toEqual(200);

      const apiArticle: GetArticle = JSON.parse(response.payload)[0];
      for (const key of Object.keys(dbArticle)) {
        expect((dbArticle as any)[key]).toEqual((apiArticle as any)[key]);
      }
    });

    it("returns an empty list without errors", async () => {
      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/articles",
      });
      expect(response.payload).toEqual(JSON.stringify([]));
    });
  });

  describe("single article", () => {
    it("returns the the article", async () => {
      const dbArticle = await createArticle();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/articles/${dbArticle.article_id}`,
      });

      expect(response.statusCode).toEqual(200);

      const apiArticle: GetArticle = JSON.parse(response.payload);
      for (const key of Object.keys(dbArticle)) {
        expect((dbArticle as any)[key]).toEqual((apiArticle as any)[key]);
      }
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
