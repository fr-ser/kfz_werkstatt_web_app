import * as faker from "faker";
import { Client } from "pg";

export default async function () {
  process.env.BASIC_AUTH_CREDENTIALS = "test_user_1:test_pass_1,test_user_2:test_pass_2";
  process.env.DB_URI = "postgres://kfz:password@localhost:8432/kfz";

  faker.setLocale("de");

  const client = new Client({
    connectionString: process.env.DB_URI,
  });
  await client.connect();

  await client.query(`TRUNCATE document CASCADE`);
  await client.query(`TRUNCATE order_ CASCADE`);
  await client.query(`TRUNCATE article CASCADE`);
  await client.query(`TRUNCATE car CASCADE`);
  await client.query(`TRUNCATE client CASCADE`);

  await client.end();
}
