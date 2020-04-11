import { _pool } from "@backend/db/db";
import { test_pool } from "@tests/factory/factory";

afterAll(async function () {
  // close the pool to avoid open connections
  await _pool.end();
  await test_pool.end();
});
