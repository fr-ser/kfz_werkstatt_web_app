import { test_pool } from "@tests/factory/factory";
import { DbOrder, DbOrderItemArticle, DbOrderItemHeader } from "@backend/interfaces/db";

export async function getOrderItemsCount(orderId: string): Promise<number> {
  const result = await test_pool.query(
    `
    SELECT (
      (SELECT count(*)::INTEGER FROM order_item_article WHERE order_id = $1) +
      (SELECT count(*)::INTEGER FROM order_item_header WHERE order_id = $1)
    ) as count_
  `,
    [orderId]
  );
  return result.rows[0].count_;
}

export async function orderExists(orderId: string): Promise<boolean> {
  const result = await test_pool.query(
    `SELECT EXISTS(SELECT 1 FROM order_ WHERE order_id = $1) as exists_`,
    [orderId]
  );
  return result.rows[0].exists_;
}

export async function getDbOrder(orderId: string): Promise<DbOrder> {
  const result = await test_pool.query(`SELECT * FROM order_ WHERE order_id = $1`, [orderId]);
  return result.rows[0];
}

export async function getDbOrderArticles(orderId: string): Promise<DbOrderItemArticle[]> {
  const result = await test_pool.query(`SELECT * FROM order_item_article WHERE order_id = $1`, [
    orderId,
  ]);
  return result.rows;
}

export async function getDbOrderHeaders(orderId: string): Promise<DbOrderItemHeader[]> {
  const result = await test_pool.query(`SELECT * FROM order_item_header WHERE order_id = $1`, [
    orderId,
  ]);
  return result.rows;
}
