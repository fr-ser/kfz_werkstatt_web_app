import * as faker from "faker";

import { DbDocument, DbDocumentType, DbOrder } from "@backend/interfaces/db";

import { Fixture, _test_pool } from "@tests/factory/factory";
import { getRandomEnumValue, getRandomDate } from "../helpers";
import { createOrder } from "./order";

function getDocumentCleanup(documentId: string, order: Fixture<DbOrder>) {
  return async function() {
    await _test_pool.query(`DELETE FROM document WHERE document_id = $1`, [documentId]);
    await order.destroy();
  };
}

export async function createDocument(): Promise<Fixture<DbDocument>> {
  const order = await createOrder();

  const document = {
    document_id: `Sth${Date.now()}`,
    art: getRandomEnumValue(DbDocumentType),
    creation_date: getRandomDate(),
    title: faker.random.words(),
    client_id: order.element.client_id,
    car_id: order.element.car_id,
    order_id: order.element.order_id,
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

  return { element: document, destroy: getDocumentCleanup(document.document_id, order) };
}
