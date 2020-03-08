import { Pool, types, PoolClient } from "pg";

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

type TransactionFunction = (pgClient: PoolClient, ...args: any[]) => Promise<void>;

export async function executeWithTransaction(func: TransactionFunction, args?: any[]) {
  const pgClient = await _pool.connect();
  try {
    await pgClient.query("BEGIN");

    const function_arguments = args || [];
    await func(pgClient, ...function_arguments);

    await pgClient.query("COMMIT");
  } catch (e) {
    await pgClient.query("ROLLBACK");
    throw e;
  } finally {
    pgClient.release();
  }
}
