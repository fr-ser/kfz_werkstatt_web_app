import { _pool } from "@backend/db/db";
import { DbArticle } from "@backend/interfaces/db";

export async function getArticles(): Promise<DbArticle[]>;
export async function getArticles(articleId: string): Promise<DbArticle | null>;
export async function getArticles(articleId?: string): Promise<DbArticle[] | DbArticle | null> {
  if (!articleId) {
    return (await _pool.query("SELECT * FROM article")).rows;
  } else {
    let maybe_article = await _pool.query("SELECT * FROM article WHERE article_id = $1", [
      articleId,
    ]);
    if (maybe_article.rowCount === 1) {
      return maybe_article.rows[0];
    } else {
      return null;
    }
  }
}
