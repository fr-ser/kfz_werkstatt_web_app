import * as faker from "faker";

import { DbArticle } from "@backend/interfaces/db";

import { test_pool } from "@tests/factory/factory";

export async function createArticle(): Promise<DbArticle> {
  const article = {
    article_number: faker.commerce.product() + Date.now() + faker.random.number(100),
    description: faker.commerce.product(),
    price: faker.random.number(),
    stock_amount: faker.random.number(),
  };

  await test_pool.query(
    `
      INSERT INTO article (
          article_number, description, price, stock_amount
      ) VALUES ($1, $2, $3, $4)
    `,
    [article.article_number, article.description, article.price, article.stock_amount]
  );

  return article;
}
