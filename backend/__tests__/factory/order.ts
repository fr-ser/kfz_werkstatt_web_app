import * as faker from "faker";

import {
  DbOrder,
  DbPaymentMethod,
  DbOrderState,
  DbOrderItemArticle,
  DbOrderItemHeader,
} from "@backend/interfaces/db";

import { test_pool } from "@tests/factory/factory";
import { createCar } from "@tests/factory/car";
import { createClient } from "@tests/factory/client";
import { getRandomDate, getRandomEnumValue, getRandomArticleId } from "@tests/helpers";

export async function createOrder(): Promise<DbOrder> {
  const car = await createCar();
  const client = await createClient();

  const result = await test_pool.query(
    `
      INSERT INTO order_ (
        order_id, car_id, client_id, title, date, payment_due_date, payment_method, state,
        description, mileage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
    [
      `Auf${Date.now()}`,
      car.car_id,
      client.client_id,
      faker.random.words(),
      getRandomDate(),
      getRandomDate(),
      getRandomEnumValue(DbPaymentMethod),
      getRandomEnumValue(DbOrderState),
      faker.random.words(),
      faker.random.number(),
    ]
  );

  return result.rows[0];
}

interface orderItemArticleOptions {
  orderId?: string;
  position?: number;
}
export async function createOrderItemArticle(
  opts?: orderItemArticleOptions
): Promise<DbOrderItemArticle> {
  let options = opts || {};

  const result = await test_pool.query(
    `
      INSERT INTO order_item_article (
        order_id, article_id, position, description, amount, price_per_item, discount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      // id for the table will be auto generated
      options.orderId || (await createOrder()).order_id,
      getRandomArticleId(),
      options.position || Date.now() % 123456789,
      faker.random.words(2),
      faker.random.number(),
      faker.random.number({ precision: 0.2 }),
      faker.random.number({ max: 1, precision: 0.01 }),
    ]
  );

  return result.rows[0];
}

interface orderItemHeaderOptions {
  orderId?: string;
  position?: number;
}
export async function createOrderItemHeader(
  opts?: orderItemHeaderOptions
): Promise<DbOrderItemHeader> {
  let options = opts || {};

  const result = await test_pool.query(
    `
      INSERT INTO order_item_header (order_id, position, header)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [
      // id for the table will be auto generated
      options.orderId || (await createOrder()).order_id,
      options.position || Date.now() % 123456789,
      faker.random.words(2),
    ]
  );

  return result.rows[0];
}
