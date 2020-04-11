import server from "@backend/server";

import { getDbArticle, articleExists } from "@tests/articles/helpers";
import { getAuthHeader } from "@tests/helpers";
import { smartCleanup } from "@tests/factory/factory";
import { createArticle } from "@tests/factory/article";

describe("articles - PUT", () => {
  beforeAll(async () => {
    await server.ready();
  });

  let cleanupArticles: string[] = [];

  afterEach(async () => {
    await smartCleanup({ articles: cleanupArticles });
    cleanupArticles = [];
  });

  it("edits an article", async () => {
    const article = await createArticle();
    cleanupArticles.push(article.article_number);
    const newNumber = "asdf";
    cleanupArticles.push(newNumber);

    const response = await server.inject({
      method: "PUT",
      headers: { ...getAuthHeader() },
      url: `/api/articles/${article.article_number}`,
      payload: {
        article_number: newNumber,
        description: "Esteban",
        stock_amount: 12345,
        price: 123.45,
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(await articleExists(article.article_number)).toBeFalsy();
    const dbArticle = await getDbArticle(newNumber);
    expect(dbArticle.description).toEqual("Esteban");
    expect(dbArticle.stock_amount).toEqual(12345);
    expect(dbArticle.price).toEqual(123.45);
  });

  const invalidPayloads = [
    {},
    { some: "weird_stuff" },
    { description: "Julio", some: "valid and invalid" },
  ];
  for (const payload of invalidPayloads) {
    it(`returns 400 for ${JSON.stringify(payload)}`, async () => {
      const article = createArticle();
      const response = await server.inject({
        method: "PUT",
        headers: { ...getAuthHeader() },
        url: `/api/articles/${(await article).article_number}`,
        payload,
      });

      expect(response.statusCode).toEqual(400);
    });
  }
});
