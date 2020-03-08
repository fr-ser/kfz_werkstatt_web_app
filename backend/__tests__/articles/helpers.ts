import { test_pool } from "@tests/factory/factory";
import { DbArticle } from "@backend/interfaces/db";

export async function getArticleCount(): Promise<number> {
  const result = await test_pool.query("SELECT count(*)::INTEGER as count_ FROM article");
  return result.rows[0].count_;
}

export async function articleExists(articleId: string): Promise<boolean> {
  const result = await test_pool.query(
    `SELECT EXISTS(SELECT 1 FROM article WHERE article_id = $1) as exists_`,
    [articleId]
  );
  return result.rows[0].exists_;
}

export async function getDbArticle(articleId: string): Promise<DbArticle> {
  const result = await test_pool.query(`SELECT * FROM article WHERE article_id = $1`, [articleId]);
  return result.rows[0];
}
