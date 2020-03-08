import { test_pool } from "@tests/factory/factory";
import { DbClient } from "@backend/interfaces/db";

export async function getCarsOfClient(clientId: string): Promise<Set<string>> {
  const result = await test_pool.query("SELECT car_id from car_ownership WHERE client_id = $1", [
    clientId,
  ]);
  return new Set(result.rows.map(row => row.car_id));
}

export async function getClientCount(): Promise<number> {
  const result = await test_pool.query("SELECT count(*)::INTEGER as count_ FROM client");
  return result.rows[0].count_;
}

export async function clientExists(clientId: string): Promise<boolean> {
  const result = await test_pool.query(
    `SELECT EXISTS(SELECT 1 FROM client WHERE client_id = $1) as exists_`,
    [clientId]
  );
  return result.rows[0].exists_;
}

export async function getDbClient(clientId: string): Promise<DbClient> {
  const result = await test_pool.query(`SELECT * FROM client WHERE client_id = $1`, [clientId]);
  return result.rows[0];
}
