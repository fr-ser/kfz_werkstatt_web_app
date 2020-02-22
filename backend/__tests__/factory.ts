import { Pool } from "pg";
import * as faker from "faker";

import { DB_URI } from "../config";

export const _test_pool = new Pool({
  connectionString: DB_URI,
  application_name: "jest-test",
});

export interface Factory {
  destroy: () => Promise<void>;
}

function getClientCleanup(clientId: string) {
  return async function() {
    await _test_pool.query(`DELETE FROM clients WHERE client_id = $1`, [clientId]);
  };
}

export async function createUser(): Promise<Factory> {
  const clientId = `K${Date.now()}`;
  await _test_pool.query(
    `
        INSERT INTO clients (
            client_id, first_name, last_name, email, phone_number, company_name,
            birthday, comment, mobile_number, zip_code, city, street_and_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `,
    [
      clientId,
      faker.name.firstName(),
      faker.name.lastName(),
      faker.internet.email(),
      faker.phone.phoneNumber(),
      faker.company.companyName(),
      faker.date
        .past()
        .toISOString()
        .substr(0, 10),
      faker.lorem.words(7),
      faker.phone.phoneNumber(),
      faker.random.number(99999),
      faker.address.city(),
      faker.address.streetAddress(),
    ]
  );
  return { destroy: getClientCleanup(clientId) };
}
