import * as faker from "faker";

import { DbClient } from "@backend/interfaces/db";

import { test_pool } from "@tests/factory/factory";
import { getRandomDate } from "@tests/helpers";

export async function createClient(carIds?: string[]): Promise<DbClient> {
  const client = {
    client_id: `K${Date.now()}`,
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    email: faker.internet.email(),
    phone_number: faker.phone.phoneNumber(),
    company_name: faker.company.companyName(),
    birthday: getRandomDate(),
    comment: faker.lorem.words(7),
    mobile_number: faker.phone.phoneNumber(),
    zip_code: faker.random.number({ min: 1, max: 99999 }),
    city: faker.address.city(),
    street_and_number: faker.address.streetAddress(),
  };

  await test_pool.query(
    `
        INSERT INTO client (
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

  if (carIds && carIds.length) {
    const query_args = carIds.reduce(
      (acc, carId, idx) => {
        // arguments are a bit tricky because the client id needs to
        // go to each carId (thats why we double the idx)
        acc.args.push(carId, client.client_id);
        acc.ordinals.push(`($${idx * 2 + 1}, $${idx * 2 + 2})`);
        return acc;
      },
      { ordinals: [] as string[], args: [] as string[] }
    );

    await test_pool.query(
      `INSERT INTO car_ownership (car_id, client_id) VALUES ${query_args.ordinals.join(", ")}`,
      query_args.args
    );
  }

  return client;
}
