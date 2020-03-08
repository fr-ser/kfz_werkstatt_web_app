import { PoolClient, Pool } from "pg";

import { NotFoundError } from "@backend/common";
import { _pool } from "@backend/db/db";
import { GetArticle, SaveArticle, EditArticle } from "@backend/interfaces/api";

export async function getArticle(articleId: string): Promise<GetArticle> {
  let maybe_article = await _pool.query("SELECT * from article WHERE article_id = $1", [articleId]);
  if (maybe_article.rowCount === 1) {
    return maybe_article.rows[0];
  } else {
    throw new NotFoundError(`Could not find article with id ${articleId}`);
  }
}

export async function getArticles(): Promise<GetArticle[]> {
  return (await _pool.query("SELECT * from article")).rows;
}

export async function articleExists(
  pgClient: PoolClient | Pool,
  articleId: string
): Promise<boolean> {
  const result = await pgClient.query(
    "SELECT EXISTS(SELECT 1 FROM article WHERE article_id = $1) as exists_",
    [articleId]
  );

  return result.rows[0].exists_;
}

export async function deleteArticle(articleId: string) {
  if (!(await articleExists(_pool, articleId))) {
    throw new NotFoundError(`Could not find article with id ${articleId}`);
  } else {
    await _pool.query("DELETE FROM article WHERE article_id = $1", [articleId]);
  }
}

export async function saveArticle(article: SaveArticle) {
  await _pool.query(
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
}

export async function editArticle(articleId: string, newProperties: EditArticle) {
  if (!(await articleExists(_pool, articleId))) {
    throw new NotFoundError(`Could not find article with id ${articleId}`);
  }

  const queryArgs = Object.entries(newProperties).reduce(
    (acc, [property, value], idx) => {
      acc.arguments.push(value);
      acc.query.push(`${property} = $${acc.arguments.length}`);
      return acc;
    },
    { query: [] as string[], arguments: [articleId] as any[] }
  );

  if (queryArgs.query.length) {
    await _pool.query(
      `UPDATE article SET ${queryArgs.query.join(", ")} WHERE article_id = $1`,
      queryArgs.arguments
    );
  }
}
