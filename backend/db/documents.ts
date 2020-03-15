import { Pool, PoolClient } from "pg";

import { _pool, executeWithTransaction } from "@backend/db/db";
import { GetDocument, SaveDocument } from "@backend/interfaces/api";
import { NotFoundError, BusinessConstraintError } from "@backend/common";

const apiOrderQuery = `
  WITH order_dict AS (
    SELECT
      document_id
      , json_build_object(
        'title', title
        , 'date', date
        , 'payment_due_date', payment_due_date
        , 'payment_method', payment_method
        , 'mileage', mileage
      ) AS dict
    FROM document_order
  )
  , car_dict AS (
    SELECT
      document_id
      , json_build_object(
        'license_plate', license_plate
        , 'manufacturer', manufacturer
        , 'model', model
        , 'vin', vin
      ) AS dict
    FROM document_car
  )
  , client_dict AS (
    SELECT
      document_id
      , json_build_object(
        'client_id', client_id
        ,'first_name', first_name
        ,'last_name', last_name
        ,'company_name', company_name
        ,'city', city
        ,'zip_code', zip_code
        ,'street_and_number', street_and_number
      ) AS dict
    FROM document_client
  )
  , item_dict AS (
    SELECT
      document_id
      , position
      , json_build_object(
        'position', position
        , 'article_id', article_id
        , 'description', description
        , 'amount', amount
        , 'price_per_item', price_per_item
        , 'discount', discount
      ) AS dict
    FROM document_order_item_article
    UNION ALL
    SELECT
      document_id
      , position
      , json_build_object(
        'position', position
        , 'header', header
      ) AS dict
    FROM document_order_item_header
  )
  , ordered_dicts AS (
    SELECT * FROM item_dict ORDER BY document_id, position ASC
  )
  , item_list AS (
    SELECT document_id, json_agg(dict) as items FROM ordered_dicts GROUP BY document_id
  )
  SELECT document.*
    , order_dict.dict as order
    , car_dict.dict as car
    , client_dict.dict as client
    , item_list.items as items
  FROM document
  LEFT JOIN order_dict using(document_id)
  LEFT JOIN car_dict using(document_id)
  LEFT JOIN client_dict using(document_id)
  LEFT JOIN item_list using(document_id)
`;

export async function getDocument(documentId: string): Promise<GetDocument> {
  let maybe_document = await _pool.query(apiOrderQuery + "WHERE document_id = $1", [documentId]);
  if (maybe_document.rowCount === 1) {
    return maybe_document.rows[0];
  } else {
    throw new NotFoundError(`Could not find document with id ${documentId}`);
  }
}

export async function getDocuments(): Promise<GetDocument[]> {
  return (await _pool.query(apiOrderQuery)).rows;
}

export async function documentExists(
  pgClient: PoolClient | Pool,
  documentId: string
): Promise<boolean> {
  const result = await pgClient.query(
    "SELECT EXISTS(SELECT 1 FROM document WHERE document_id = $1) as exists_",
    [documentId]
  );

  return result.rows[0].exists_;
}

export async function deleteDocument(documentId: string) {
  if (!(await documentExists(_pool, documentId))) {
    throw new NotFoundError(`Could not find document with id ${documentId}`);
  } else {
    await _pool.query(
      `
      WITH document_client_delete AS (
        DELETE FROM document_client WHERE document_id = $1
      )
      , document_car_delete AS (
        DELETE FROM document_car WHERE document_id = $1
      )
      , document_order_delete AS (
        DELETE FROM document_order WHERE document_id = $1
      )
      , document_order_header_delete AS (
        DELETE FROM document_order_item_header WHERE document_id = $1
      )
      , document_order_article_delete AS (
        DELETE FROM document_order_item_article WHERE document_id = $1
      )
      DELETE FROM document WHERE document_id = $1
    `,
      [documentId]
    );
  }
}

export async function _saveDocument(pgClient: PoolClient, document: SaveDocument) {
  const articlesExist = (
    await pgClient.query(
      "SELECT EXISTS(SELECT 1 FROM order_item_article WHERE order_id = $1) as exists_",
      [document.order_id]
    )
  ).rows[0].exists_;

  if (!articlesExist) {
    throw new BusinessConstraintError("Can not create a document without article order items");
  }

  await pgClient.query(
    `
      INSERT INTO document (document_id, type, order_id, creation_date)
      VALUES ($1, $2, $3, (now() at time zone 'utc')::DATE)
    `,
    [document.document_id, document.type, document.order_id]
  );

  await pgClient.query(
    `
      INSERT INTO document_car (document_id, license_plate, manufacturer, model, vin)
      SELECT $1, license_plate, manufacturer, model, vin
      FROM car WHERE car_id = $2
    `,
    [document.document_id, document.car_id]
  );

  await pgClient.query(
    `
      INSERT INTO document_client (
        document_id, client_id, first_name, last_name, company_name, zip_code, city, street_and_number
      )
      SELECT $1, client_id, first_name, last_name, company_name, zip_code, city, street_and_number
      FROM client WHERE client_id = $2
    `,
    [document.document_id, document.client_id]
  );

  await pgClient.query(
    `
      INSERT INTO document_order (
        document_id, date, mileage, payment_due_date, payment_method, title
      )
      SELECT $1, date, mileage, payment_due_date, payment_method, title
      FROM order_ WHERE order_id = $2
    `,
    [document.document_id, document.order_id]
  );

  await pgClient.query(
    `
      INSERT INTO document_order_item_header (document_id, position, header)
      SELECT $1, position, header
      FROM order_item_header WHERE order_id = $2
    `,
    [document.document_id, document.order_id]
  );

  await pgClient.query(
    `
      INSERT INTO document_order_item_article (
        document_id, position, article_id, amount, description, discount, price_per_item
      )
      SELECT $1, position, article_id, amount, description, discount, price_per_item
      FROM order_item_article WHERE order_id = $2
    `,
    [document.document_id, document.order_id]
  );
}

export async function saveDocument(document: SaveDocument) {
  await executeWithTransaction(_saveDocument, [document]);
}
