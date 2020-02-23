import { Pool, types } from "pg";

// select typname, oid, typarray from pg_type where typname = 'numeric' order by oid;
const OID_NUMERIC = 1700;
const OID_DATE = 1082;

types.setTypeParser(OID_NUMERIC, number => parseFloat(number));
types.setTypeParser(OID_DATE, date_str => date_str);

import { DB_URI } from "../config";

export const _pool = new Pool({
  connectionString: DB_URI,
  max: 5,
  application_name: "kfz",
});
