import { NotFoundError } from "@backend/common";
import {
  getArticle,
  getArticles,
  deleteArticle,
  saveArticle,
  editArticle,
} from "@backend/db/articles";

import { createArticle } from "@tests/factory/article";
import { db_cleanup } from "@tests/factory/factory";
import { getArticleCount, articleExists, getDbArticle } from "@tests/articles/helpers";

describe("articles - database queries", () => {
  beforeEach(async () => {
    await db_cleanup();
  });

  describe("getArticle", () => {
    it("returns the article", async () => {
      const dbArticle = await createArticle();

      const apiArticle = await getArticle(dbArticle.article_id);

      for (const key of Object.keys(dbArticle)) {
        expect((apiArticle as any)[key]).toEqual((dbArticle as any)[key]);
      }
    });

    it("throws the NotFoundError if no article exists", async () => {
      try {
        await getArticle("not_existing");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("getArticles", () => {
    it("returns an empty list for no articles", async () => {
      expect(await getArticles()).toEqual([]);
    });

    it("returns all articles", async () => {
      const dbArticle1 = await createArticle();
      const dbArticle2 = await createArticle();

      const apiArticles = await getArticles();

      expect(apiArticles).toHaveLength(2);

      const apiArticle1 = apiArticles.find(x => x.article_id === dbArticle1.article_id);
      const apiArticle2 = apiArticles.find(x => x.article_id === dbArticle2.article_id);

      for (const key of Object.keys(dbArticle1)) {
        expect((apiArticle1 as any)[key]).toEqual((dbArticle1 as any)[key]);
      }

      for (const key of Object.keys(dbArticle2)) {
        expect((apiArticle2 as any)[key]).toEqual((dbArticle2 as any)[key]);
      }
    });
  });

  describe("deleteArticle", () => {
    it("deletes an article", async () => {
      await createArticle(); // one article, which should not be deleted
      const dbArticle = await createArticle();

      expect(await articleExists(dbArticle.article_id)).toBe(true);
      expect(await getArticleCount()).toBe(2);

      await deleteArticle(dbArticle.article_id);

      expect(await articleExists(dbArticle.article_id)).toBe(false);
      expect(await getArticleCount()).toBe(1);
    });

    it("throws the NotFoundError, if the article does not exist", async () => {
      try {
        await deleteArticle("not_existing");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("saveArticle", () => {
    it("saves an article with no articles", async () => {
      const articleId = "sth";
      expect(await articleExists(articleId)).toBe(false);

      await saveArticle({
        article_id: articleId,
        description: "B-12-12",
      });

      expect(await articleExists(articleId)).toBe(true);
    });

    it("throws an error if the article cannot be saved", async () => {
      try {
        await saveArticle({} as any);
      } catch (error) {
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("editArticle", () => {
    const changeableStringProperties = ["description", "article_number"];
    for (const changeProperty of changeableStringProperties) {
      it(`changes the property: ${changeProperty}`, async () => {
        const article = await createArticle();

        await editArticle(article.article_id, { [changeProperty]: "newValue" });

        const dbArticle = await getDbArticle(article.article_id);
        expect((dbArticle as any)[changeProperty]).toEqual("newValue");
      });
    }

    const changeableNumberProperties = ["stock_amount", "price"];
    for (const changeProperty of changeableNumberProperties) {
      it(`changes the property: ${changeProperty}`, async () => {
        const article = await createArticle();

        await editArticle(article.article_id, { [changeProperty]: 12345 });

        const dbArticle = await getDbArticle(article.article_id);
        expect((dbArticle as any)[changeProperty]).toEqual(12345);
      });
    }

    it("changes multiple properties at once", async () => {
      const article = await createArticle();

      await editArticle(article.article_id, {
        description: "HH-12-12",
        stock_amount: 12345,
        price: 12.345,
      });

      const dbArticle = await getDbArticle(article.article_id);
      expect(dbArticle.description).toEqual("HH-12-12");
      expect(dbArticle.stock_amount).toEqual(12345);
      expect(dbArticle.price).toEqual(12.345);
    });

    it("throws an error if the article cannot be edited", async () => {
      try {
        await editArticle("asdf", { x: "y" } as any);
      } catch (error) {
        return;
      }
      fail("nothing thrown");
    });

    it("throws the NotFoundError if the article does not exist", async () => {
      try {
        await editArticle("not_existing", {} as any);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });
});
