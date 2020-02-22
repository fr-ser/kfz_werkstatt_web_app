import { _pool } from "./db";

export async function getClients() {
  const client = await _pool.connect();
  try {
    return client.query("SELECT * FROM clients");
  } finally {
    client.release();
  }
}
