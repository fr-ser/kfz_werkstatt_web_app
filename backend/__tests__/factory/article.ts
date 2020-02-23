import * as faker from "faker";

import { DbArticle } from "@backend/interfaces/db";

import { Fixture, _test_pool } from "@tests/factory/factory";

function getArticleCleanup(articleId: string) {
  return async function() {
    await _test_pool.query(`DELETE FROM article WHERE article_id = $1`, [articleId]);
  };
}

export async function createArticle(): Promise<Fixture<DbArticle>> {
  const article = {
    article_id: `Art${Date.now()}`,
    description: faker.commerce.product(),
    article_number: faker.commerce.product(),
    stock_amount: faker.random.number(),
    price: faker.random.number(),
  };

  await _test_pool.query(
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

  return { element: article, destroy: getArticleCleanup(article.article_id) };
}
