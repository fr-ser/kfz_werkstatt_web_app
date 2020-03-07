import * as faker from "faker";

import { DbDocument, DbDocumentType } from "@backend/interfaces/db";

import { _test_pool } from "@tests/factory/factory";
import { getRandomEnumValue, getRandomDate } from "../helpers";
import { createOrder } from "./order";

export async function createDocument(): Promise<DbDocument> {
  const order = await createOrder();

  const document = {
    document_id: `Sth${Date.now()}`,
    art: getRandomEnumValue(DbDocumentType),
    creation_date: getRandomDate(),
    title: faker.random.words(),
    client_id: order.client_id,
    car_id: order.car_id,
    order_id: order.order_id,
    document_content: {},
  };

  await _test_pool.query(
    `
        INSERT INTO document (
          document_id, art, creation_date, title, client_id, car_id, order_id, document_content
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      document.document_id,
      document.art,
      document.creation_date,
      document.title,
      document.client_id,
      document.car_id,
      document.order_id,
      document.document_content,
    ]
  );

  return document;
}
