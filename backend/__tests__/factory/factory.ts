import { Pool } from "pg";

import { DB_URI } from "@backend/config";

export const test_pool = new Pool({
  connectionString: DB_URI,
  application_name: "jest-test",
});

export async function db_cleanup() {
  await test_pool.query(`TRUNCATE document CASCADE`);
  await test_pool.query(`TRUNCATE order_ CASCADE`);
  await test_pool.query(`TRUNCATE article CASCADE`);
  await test_pool.query(`TRUNCATE car CASCADE`);
  await test_pool.query(`TRUNCATE client CASCADE`);
}
