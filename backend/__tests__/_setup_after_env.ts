import { _pool } from "../db/db";
import { _test_pool } from "./factory";

afterAll(async function() {
  // close the pool to avoid open connections
  await _pool.end();
  await _test_pool.end();
});
