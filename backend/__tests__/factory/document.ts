import * as faker from "faker";

import { DbDocument } from "@backend/interfaces/db";
import { DocumentType } from "@backend/interfaces/api";

import { test_pool } from "@tests/factory/factory";
import { getRandomEnumValue, getRandomDate } from "../helpers";
import { createOrder, createOrderItemHeader, createOrderItemArticle } from "./order";
import { getDbOrder, getDbOrderHeaders, getDbOrderArticles } from "../orders/helpers";
import { getDbClient } from "../clients/helpers";
import { getDbCar } from "../cars/helpers";

interface OrderOptions {
  orderId?: string;
  createPositions?: boolean;
}
export async function createDocument(options: OrderOptions = {}): Promise<DbDocument> {
  const order = options.orderId ? await getDbOrder(options.orderId) : await createOrder();
  // if an orderId was passed createPositions must be true to create
  // order items. Otherwise the default is to create items.
  if (
    (options.orderId && options.createPositions) ||
    (!options.orderId && options.createPositions !== false)
  ) {
    await createOrderItemHeader({ position: 1, orderId: order.order_id });
    await createOrderItemArticle({ position: 2, orderId: order.order_id });
    await createOrderItemArticle({ position: 3, orderId: order.order_id });
  }
  const orderItemHeaders = await getDbOrderHeaders(order.order_id);
  const orderItemArticles = await getDbOrderArticles(order.order_id);
  const client = await getDbClient(order.client_id);
  const car = await getDbCar(order.car_id);

  const documentId = `Sth${Date.now() + faker.random.number(100)}`;

  const result = await test_pool.query(
    `
      INSERT INTO document (document_id, type, creation_date, order_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [documentId, getRandomEnumValue(DocumentType), getRandomDate(), order.order_id]
  );

  await test_pool.query(
    `
      WITH client_insert AS (
        INSERT INTO document_client (
          document_id, client_id, first_name, last_name, company_name, zip_code, city,
          street_and_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      )
      , car_insert AS (
        INSERT INTO document_car (document_id, license_plate, manufacturer, model, vin)
        VALUES ($1, $9, $10, $11, $12)
      )
      -- order_insert
      INSERT INTO document_order (
        document_id, title, date, payment_due_date, payment_method, mileage
      ) VALUES ($1, $13, $14, $15, $16, $17)
    `,
    [
      documentId,
      client.client_id,
      client.first_name,
      client.last_name,
      client.company_name,
      client.zip_code,
      client.city,
      client.street_and_number,
      car.license_plate,
      car.manufacturer,
      car.model,
      car.vin,
      order.title,
      order.date,
      order.payment_due_date,
      order.payment_method,
      order.mileage,
    ]
  );

  for (const header of orderItemHeaders) {
    await test_pool.query(
      `
        INSERT INTO document_order_item_header (document_id, position, header)
        VALUES ($1, $2, $3)
      `,
      [documentId, header.position, header.header]
    );
  }

  for (const article of orderItemArticles) {
    await test_pool.query(
      `
        INSERT INTO document_order_item_article (
          document_id, article_id, position, description, amount, price_per_item, discount
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        documentId,
        article.article_id,
        article.position,
        article.description,
        article.amount,
        article.price_per_item,
        article.discount,
      ]
    );
  }

  return result.rows[0];
}
