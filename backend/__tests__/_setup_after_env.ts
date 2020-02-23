import { _pool } from "@backend/db/db";
import { _test_pool } from "@tests/factory/factory";

afterAll(async function() {
  // close the pool to avoid open connections
  await _pool.end();
  await _test_pool.end();
});
