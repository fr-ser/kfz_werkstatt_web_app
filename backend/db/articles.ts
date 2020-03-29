import { PoolClient, Pool } from "pg";

import { NotFoundError } from "@backend/common";
import { _pool } from "@backend/db/db";
import { GetArticle, SaveArticle, EditArticle } from "@backend/interfaces/api";

export async function getArticle(articleNumber: string): Promise<GetArticle> {
  let maybe_article = await _pool.query("SELECT * from article WHERE article_number = $1", [
    articleNumber,
  ]);
  if (maybe_article.rowCount === 1) {
    return maybe_article.rows[0];
  } else {
    throw new NotFoundError(`Could not find article with id ${articleNumber}`);
  }
}

export async function getArticles(): Promise<GetArticle[]> {
  return (await _pool.query("SELECT * from article")).rows;
}

export async function articleExists(
  pgClient: PoolClient | Pool,
  articleNumber: string
): Promise<boolean> {
  const result = await pgClient.query(
    "SELECT EXISTS(SELECT 1 FROM article WHERE article_number = $1) as exists_",
    [articleNumber]
  );

  return result.rows[0].exists_;
}

export async function deleteArticle(articleNumber: string) {
  if (!(await articleExists(_pool, articleNumber))) {
    throw new NotFoundError(`Could not find article with id ${articleNumber}`);
  } else {
    await _pool.query("DELETE FROM article WHERE article_number = $1", [articleNumber]);
  }
}

export async function saveArticle(article: SaveArticle) {
  await _pool.query(
    `
      INSERT INTO article (
          article_number, description, price, stock_amount
      ) VALUES ($1, $2, $3, $4)
    `,
    [article.article_number, article.description, article.price, article.stock_amount]
  );
}

export async function editArticle(articleNumber: string, newProperties: EditArticle) {
  if (!(await articleExists(_pool, articleNumber))) {
    throw new NotFoundError(`Could not find article with id ${articleNumber}`);
  }

  const queryArgs = Object.entries(newProperties).reduce(
    (acc, [property, value], idx) => {
      acc.arguments.push(value);
      acc.query.push(`${property} = $${acc.arguments.length}`);
      return acc;
    },
    { query: [] as string[], arguments: [articleNumber] as any[] }
  );

  if (queryArgs.query.length) {
    await _pool.query(
      `UPDATE article SET ${queryArgs.query.join(", ")} WHERE article_number = $1`,
      queryArgs.arguments
    );
  }
}
