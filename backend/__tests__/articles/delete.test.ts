import server from "@backend/server";

import { getAuthHeader } from "@tests/helpers";
import { articleExists } from "@tests/articles/helpers";
import { createArticle } from "@tests/factory/article";

describe("articles - DELETE", () => {
  beforeAll(async () => {
    await server.ready();
  });

  it("deletes a article", async () => {
    const article = await createArticle();

    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/articles/${article.article_number}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(await articleExists(article.article_number)).toBeFalsy();
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
