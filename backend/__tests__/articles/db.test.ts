import { NotFoundError } from "@backend/common";
import {
  getArticle,
  getArticles,
  deleteArticle,
  saveArticle,
  editArticle,
} from "@backend/db/articles";

import { createArticle } from "@tests/factory/article";
import { smartCleanup } from "@tests/factory/factory";
import { articleExists, getDbArticle } from "@tests/articles/helpers";

describe("articles - database queries", () => {
  let cleanupArticles: string[] = [];

  afterEach(async () => {
    await smartCleanup({ articles: cleanupArticles });
    cleanupArticles = [];
  });

  describe("getArticle", () => {
    it("returns the article", async () => {
      const dbArticle = await createArticle();
      cleanupArticles.push(dbArticle.article_number);

      const apiArticle = await getArticle(dbArticle.article_number);

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
    it("returns all articles", async () => {
      const dbArticle1 = await createArticle();
      const dbArticle2 = await createArticle();
      cleanupArticles.push(dbArticle1.article_number);
      cleanupArticles.push(dbArticle2.article_number);

      const apiArticles = await getArticles();

      // could be greater because of interference of other tests
      expect(apiArticles.length).toBeGreaterThanOrEqual(2);

      const apiArticle1 = apiArticles.find((x) => x.article_number === dbArticle1.article_number);
      const apiArticle2 = apiArticles.find((x) => x.article_number === dbArticle2.article_number);

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
      const dbArticle = await createArticle();

      expect(await articleExists(dbArticle.article_number)).toBe(true);

      await deleteArticle(dbArticle.article_number);

      expect(await articleExists(dbArticle.article_number)).toBe(false);
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
    it("saves an article", async () => {
      const articleNumber = "sth" + Date.now();
      cleanupArticles.push(articleNumber);

      const payload = {
        article_number: articleNumber,
        price: 0.245,
        description: "B-12-12",
      };
      await saveArticle(payload);

      const dbArticle = await getDbArticle(articleNumber);
      for (const [key, value] of Object.entries(payload)) {
        expect((dbArticle as any)[key]).toEqual(value);
      }
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
    const changeableStringProperties = ["description"];
    for (const changeProperty of changeableStringProperties) {
      it(`changes the property: ${changeProperty}`, async () => {
        const article = await createArticle();
        cleanupArticles.push(article.article_number);

        await editArticle(article.article_number, { [changeProperty]: "newValue" });

        const dbArticle = await getDbArticle(article.article_number);
        expect((dbArticle as any)[changeProperty]).toEqual("newValue");
      });
    }

    const changeableNumberProperties = ["stock_amount", "price"];
    for (const changeProperty of changeableNumberProperties) {
      it(`changes the property: ${changeProperty}`, async () => {
        const article = await createArticle();
        cleanupArticles.push(article.article_number);

        await editArticle(article.article_number, { [changeProperty]: 12345 });

        const dbArticle = await getDbArticle(article.article_number);
        expect((dbArticle as any)[changeProperty]).toEqual(12345);
      });
    }

    it("changes multiple properties at once", async () => {
      const article = await createArticle();
      cleanupArticles.push(article.article_number);

      await editArticle(article.article_number, {
        description: "HH-12-12",
        stock_amount: 12345,
        price: 12.345,
      });

      const dbArticle = await getDbArticle(article.article_number);
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
