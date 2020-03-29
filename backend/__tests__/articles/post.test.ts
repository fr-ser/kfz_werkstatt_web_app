import server from "@backend/server";

import { getDbArticle, getArticleCount } from "@tests/articles/helpers";
import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createArticle } from "@tests/factory/article";

describe("articles - POST", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("creates an article for a valid payload", async () => {
    const payload = {
      article_number: "Art123",
      description: "license_plate",
      price: 12.34,
      stock_amount: 12.34,
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/articles`,
      payload,
    });

    expect(response.statusCode).toEqual(201);
    expect(await getArticleCount()).toBe(1);

    const dbArticle = await getDbArticle(payload.article_number);
    for (const key of Object.keys(payload)) {
      expect((dbArticle as any)[key]).toEqual((payload as any)[key]);
    }
  });

  it("creates an article for a minimal payload", async () => {
    const payload = {
      article_number: "Art123",
      description: "license_plate",
      price: 22,
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/articles`,
      payload,
    });

    expect(response.statusCode).toEqual(201);
    expect(await getArticleCount()).toBe(1);

    const dbArticle = await getDbArticle(payload.article_number);
    for (const key of Object.keys(payload)) {
      expect((dbArticle as any)[key]).toEqual((payload as any)[key]);
    }
  });

  it("returns 422 for database errors (duplicate key)", async () => {
    const existingArticle = await createArticle();
    const payload = {
      article_number: existingArticle.article_number,
      description: "license_plate",
      price: 22,
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/articles`,
      payload,
    });

    expect(response.statusCode).toEqual(422);
    expect(await getArticleCount()).toBe(1);
  });

  describe("invalid payload", () => {
    const validPayload = {
      article_number: "Art123",
      license_plate: "a",
      manufacturer: "a",
      model: "a",
    };
    const invalidPayloads = [
      {},
      { some: "weird stuff" },
      { ...validPayload, some: "valid and invalid stuff" },
      { ...validPayload, article_number: "Artinvalid_id" },
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
        expect(await getArticleCount()).toBe(0);
      });
    }

    const requiredProperties = ["description"];
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
        expect(await getArticleCount()).toBe(0);
      });
    }
  });
});
