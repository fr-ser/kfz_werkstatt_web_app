import * as faker from "faker";

import { DbOrder, DbPaymentMethod, DbOrderState } from "@backend/interfaces/db";

import { _test_pool } from "@tests/factory/factory";
import { createCar } from "@tests/factory/car";
import { createClient } from "@tests/factory/client";
import { getRandomDate, getRandomEnumValue } from "@tests/helpers";

export async function createOrder(): Promise<DbOrder> {
  const car = await createCar();
  const client = await createClient();

  const order = {
    order_id: `Auf${Date.now()}`,
    car_id: car.car_id,
    client_id: client.client_id,
    title: faker.random.words(),
    date: getRandomDate(),
    payment_due_date: getRandomDate(),
    payment_method: getRandomEnumValue(DbPaymentMethod),
    state: getRandomEnumValue(DbOrderState),
    description: faker.random.words(),
    milage: faker.random.number(),
  };

  await _test_pool.query(
    `
        INSERT INTO order_ (
          order_id, car_id, client_id, title, date, payment_due_date, payment_method, state,
          description, milage
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
    [
      order.order_id,
      order.car_id,
      order.client_id,
      order.title,
      order.date,
      order.payment_due_date,
      order.payment_method,
      order.state,
      order.description,
      order.milage,
    ]
  );

  return order;
}
