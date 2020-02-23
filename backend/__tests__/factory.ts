import { Pool } from "pg";
import * as faker from "faker";

import { DB_URI } from "@backend/config";
import { DbClient } from "@backend/interfaces/database";

export const _test_pool = new Pool({
  connectionString: DB_URI,
  application_name: "jest-test",
});

export interface Fixture {
  destroy: () => Promise<void>;
}

function getClientCleanup(clientId: string) {
  return async function() {
    await _test_pool.query(`DELETE FROM clients WHERE client_id = $1`, [clientId]);
  };
}

export async function createUser(): Promise<Fixture & DbClient> {
  const client = {
    client_id: `K${Date.now()}`,
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    email: faker.internet.email(),
    phone_number: faker.phone.phoneNumber(),
    company_name: faker.company.companyName(),
    birthday: faker.date.past(),
    comment: faker.lorem.words(7),
    mobile_number: faker.phone.phoneNumber(),
    zip_code: faker.random.number(99999),
    city: faker.address.city(),
    street_and_number: faker.address.streetAddress(),
  };

  await _test_pool.query(
    `
        INSERT INTO clients (
            client_id, first_name, last_name, email, phone_number, company_name,
            birthday, comment, mobile_number, zip_code, city, street_and_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `,
    [
      client.client_id,
      client.first_name,
      client.last_name,
      client.email,
      client.phone_number,
      client.company_name,
      client.birthday,
      client.comment,
      client.mobile_number,
      client.zip_code,
      client.city,
      client.street_and_number,
    ]
  );

  return { ...client, destroy: getClientCleanup(client.client_id) };
}
