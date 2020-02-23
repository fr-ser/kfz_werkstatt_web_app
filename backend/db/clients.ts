import { _pool } from "@backend/db/db";
import { DbClient } from "@backend/interfaces/db";

export async function getClients(): Promise<DbClient[]>;
export async function getClients(clientId: string): Promise<DbClient | null>;
export async function getClients(clientId?: string): Promise<DbClient[] | DbClient | null> {
  if (!clientId) {
    return (await _pool.query("SELECT * FROM client")).rows;
  } else {
    let maybe_client = await _pool.query("SELECT * FROM client WHERE client_id = $1", [clientId]);
    if (maybe_client.rowCount === 1) {
      return maybe_client.rows[0];
    } else {
      return null;
    }
  }
}
