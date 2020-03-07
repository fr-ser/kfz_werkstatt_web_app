import { Pool } from "pg";

import { DB_URI } from "@backend/config";

export const _test_pool = new Pool({
  connectionString: DB_URI,
  application_name: "jest-test",
});

export interface Fixture<T> {
  element: T;
  destroy: () => Promise<void>;
}

export async function db_cleanup() {
  await _test_pool.query(`TRUNCATE document CASCADE`);
  await _test_pool.query(`TRUNCATE order_ CASCADE`);
  await _test_pool.query(`TRUNCATE article CASCADE`);
  await _test_pool.query(`TRUNCATE car CASCADE`);
  await _test_pool.query(`TRUNCATE client CASCADE`);
}
