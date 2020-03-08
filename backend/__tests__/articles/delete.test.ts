import server from "@backend/server";

import { getArticles } from "@backend/db/articles";

import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createArticle } from "@tests/factory/article";

describe("articles - DELETE", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("deletes a article", async () => {
    const article = await createArticle();

    expect(await getArticles()).toHaveLength(1);
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/articles/${article.article_id}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(await getArticles()).toHaveLength(0);
  });

  it("returns 404 for missing articles", async () => {
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/articles/sth_not_right`,
    });

    expect(response.statusCode).toEqual(404);
    expect(JSON.parse(response.payload).msg).toBeTruthy();
  });
});
