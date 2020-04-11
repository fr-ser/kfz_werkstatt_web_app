import server from "@backend/server";

import { getDbArticle } from "@tests/articles/helpers";
import { getAuthHeader } from "@tests/helpers";
import { smartCleanup } from "@tests/factory/factory";
import { createArticle } from "@tests/factory/article";

describe("articles - POST", () => {
  beforeAll(async () => {
    await server.ready();
  });

  let cleanupArticles: string[] = [];

  afterEach(async () => {
    await smartCleanup({ articles: cleanupArticles });
    cleanupArticles = [];
  });

  it("creates an article for a valid payload", async () => {
    const payload = {
      article_number: "Art1234",
      description: "license_plate",
      price: 12.34,
      stock_amount: 12.34,
    };
    cleanupArticles.push("Art1234");

    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/articles`,
      payload,
    });

    expect(response.statusCode).toEqual(201);

    const dbArticle = await getDbArticle(payload.article_number);
    for (const key of Object.keys(payload)) {
      expect((dbArticle as any)[key]).toEqual((payload as any)[key]);
    }
  });

  it("creates an article for a minimal payload", async () => {
    const payload = {
      article_number: "Art1235",
      description: "license_plate",
      price: 22,
    };
    cleanupArticles.push("Art1235");

    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/articles`,
      payload,
    });

    expect(response.statusCode).toEqual(201);

    const dbArticle = await getDbArticle(payload.article_number);
    for (const key of Object.keys(payload)) {
      expect((dbArticle as any)[key]).toEqual((payload as any)[key]);
    }
  });

  it("returns 422 for database errors (duplicate key)", async () => {
    const existingArticle = await createArticle();
    cleanupArticles.push(existingArticle.article_number);

    const payload = {
      article_number: existingArticle.article_number,
      description: "license_plate",
      price: 22,
    };

    const existingDbArticle = await getDbArticle(existingArticle.article_number);
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/articles`,
      payload,
    });

    expect(response.statusCode).toEqual(422);
    expect(existingDbArticle).toEqual(await getDbArticle(existingArticle.article_number));
  });

  describe("invalid payload", () => {
    const validPayload = {
      article_number: "Art123",
      description: "license_plate",
      price: 22,
    };
    const invalidPayloads = [
      {},
      { some: "weird stuff" },
      { ...validPayload, some: "valid and invalid stuff" },
      { ...validPayload, stock_amount: -1 },
      { ...validPayload, price: "yesterday" },
    ];
    for (const payload of invalidPayloads) {
      it(`returns 400 for ${JSON.stringify(payload)}`, async () => {
        const response = await server.inject({
          method: "POST",
          headers: { ...getAuthHeader() },
          url: `/api/articles`,
          payload,
        });

        expect(response.statusCode).toEqual(400);
      });
    }

    const requiredProperties = ["description", "article_number", "price"];
    for (const property of requiredProperties) {
      it(`returns 400 for missing ${property}`, async () => {
        const payload: any = { ...validPayload };
        delete payload[property];

        const response = await server.inject({
          method: "POST",
          headers: { ...getAuthHeader() },
          url: `/api/articles`,
          payload,
        });

        expect(response.statusCode).toEqual(400);
      });
    }
  });
});
