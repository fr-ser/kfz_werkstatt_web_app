import * as faker from "faker";

import { DbArticle } from "@backend/interfaces/db";

import { test_pool } from "@tests/factory/factory";

export async function createArticle(): Promise<DbArticle> {
  const article = {
    article_id: `Art${Date.now()}`,
    description: faker.commerce.product(),
    article_number: faker.commerce.product(),
    stock_amount: faker.random.number(),
    price: faker.random.number(),
  };

  await test_pool.query(
    `
        INSERT INTO article (
            article_id, description, article_number, stock_amount, price
        ) VALUES ($1, $2, $3, $4, $5)
    `,
    [
      article.article_id,
      article.description,
      article.article_number,
      article.stock_amount,
      article.price,
    ]
  );

  return article;
}
