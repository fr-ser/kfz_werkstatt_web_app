import { Pool } from "pg";

import { DB_URI } from "../config";

export const _pool = new Pool({
  connectionString: DB_URI,
  max: 5,
  application_name: "kfz",
});
