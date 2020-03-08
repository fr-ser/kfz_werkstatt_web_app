import server from "@backend/server";

import { getDbArticle } from "@tests/articles/helpers";
import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createArticle } from "@tests/factory/article";

describe("articles - PUT", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("edits an article", async () => {
    const article = await createArticle();

    const response = await server.inject({
      method: "PUT",
      headers: { ...getAuthHeader() },
      url: `/api/articles/${article.article_id}`,
      payload: {
        description: "Esteban",
        article_number: "1990-12-31",
        stock_amount: 12345,
        price: 123.45,
      },
    });

    expect(response.statusCode).toEqual(200);
    const dbArticle = await getDbArticle(article.article_id);
    expect(dbArticle.description).toEqual("Esteban");
    expect(dbArticle.article_number).toEqual("1990-12-31");
    expect(dbArticle.stock_amount).toEqual(12345);
    expect(dbArticle.price).toEqual(123.45);
  });

  const invalidPayloads = [
    {},
    { some: "weird_stuff" },
    { article_id: "Art1" },
    { description: "Julio", some: "valid and invalid" },
  ];
  for (const payload of invalidPayloads) {
    it(`returns 400 for ${JSON.stringify(payload)}`, async () => {
      const article = createArticle();
      const response = await server.inject({
        method: "PUT",
        headers: { ...getAuthHeader() },
        url: `/api/articles/${(await article).article_id}`,
        payload,
      });

      expect(response.statusCode).toEqual(400);
    });
  }
});
