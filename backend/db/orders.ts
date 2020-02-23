import { _pool } from "@backend/db/db";
import { DbOrder } from "@backend/interfaces/db";

export async function getOrders(): Promise<DbOrder[]>;
export async function getOrders(orderId: string): Promise<DbOrder | null>;
export async function getOrders(orderId?: string): Promise<DbOrder[] | DbOrder | null> {
  if (!orderId) {
    return (await _pool.query("SELECT * FROM order_")).rows;
  } else {
    let maybe_order = await _pool.query("SELECT * FROM order_ WHERE order_id = $1", [orderId]);
    if (maybe_order.rowCount === 1) {
      return maybe_order.rows[0];
    } else {
      return null;
    }
  }
}
