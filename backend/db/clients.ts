import { _pool } from "./db";

export async function getClients() {
  const query_result = await _pool.query("SELECT * FROM clients");
  return query_result.rows;
}
