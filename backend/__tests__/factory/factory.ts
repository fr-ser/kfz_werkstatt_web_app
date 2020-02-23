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
