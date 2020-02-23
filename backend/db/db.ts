import { Pool, types } from "pg";

// the type (numberic) could be too large for JavaScript. That is why the type needs to be
// casted specifically. For that the oid from the database is necessary:
// select typname, oid, typarray from pg_type where typname = 'numeric' order by oid;
types.setTypeParser(1700, function(val) {
  return parseFloat(val);
});

import { DB_URI } from "../config";

export const _pool = new Pool({
  connectionString: DB_URI,
  max: 5,
  application_name: "kfz",
});
