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

export async function saveClient(client: DbClient) {
  await _pool.query(
    `
        INSERT INTO client (
            client_id, first_name, last_name, email, phone_number, company_name,
            birthday, comment, mobile_number, zip_code, city, street_and_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `,
    [
      client.client_id,
      client.first_name,
      client.last_name,
      client.email,
      client.phone_number,
      client.company_name,
      client.birthday,
      client.comment,
      client.mobile_number,
      client.zip_code,
      client.city,
      client.street_and_number,
    ]
  );
}
