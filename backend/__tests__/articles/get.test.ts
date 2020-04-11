import server from "@backend/server";
import { GetArticle } from "@backend/interfaces/api";

import { createArticle } from "@tests/factory/article";
import { smartCleanup } from "@tests/factory/factory";
import { getAuthHeader } from "@tests/helpers";

describe("articles - GET", () => {
  beforeAll(async () => {
    await server.ready();
  });

  let cleanupArticles: string[] = [];

  afterEach(async () => {
    await smartCleanup({ articles: cleanupArticles });
    cleanupArticles = [];
  });

  describe("article list", () => {
    it("returns the list of articles", async () => {
      const articles = [await createArticle(), await createArticle()];
      cleanupArticles.push(...articles.map((a) => a.article_number));

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/articles",
      });
      const jsonResp: GetArticle[] = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      // could be more due to other tests
      expect(jsonResp.length).toBeGreaterThanOrEqual(2);
      expect(
        articles.every((article) =>
          jsonResp.find((respArticle) => respArticle.article_number === article.article_number)
        )
      ).toBeTruthy();
    });

    it("returns correct article properties", async () => {
      const dbArticle = await createArticle();
      cleanupArticles.push(dbArticle.article_number);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/articles",
      });

      expect(response.statusCode).toEqual(200);

      const apiArticle = JSON.parse(response.payload).find(
        (respArticle: GetArticle) => respArticle.article_number === dbArticle.article_number
      ) as GetArticle;

      for (const key of Object.keys(dbArticle)) {
        expect((dbArticle as any)[key]).toEqual((apiArticle as any)[key]);
      }
    });
  });

  describe("single article", () => {
    it("returns the the article", async () => {
      const dbArticle = await createArticle();
      cleanupArticles.push(dbArticle.article_number);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/articles/${dbArticle.article_number}`,
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
