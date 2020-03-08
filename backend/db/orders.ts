import { PoolClient, Pool } from "pg";

import { NotFoundError } from "@backend/common";
import { _pool, executeWithTransaction } from "@backend/db/db";
import {
  GetOrder,
  SaveOrder,
  EditOrder,
  ApiOrderItemHeader,
  ApiOrderItemArticle,
} from "@backend/interfaces/api";

const apiOrderQuery = `
  WITH dict_base AS (
    SELECT
      order_id
      , position
      , json_build_object(
        'position', position
        , 'article_id', article_id
        , 'description', description
        , 'amount', amount
        , 'price_per_item', price_per_item
        , 'discount', discount
      ) AS dict
    FROM order_item_article
    UNION ALL
    SELECT
      order_id
      , position
      , json_build_object(
        'position', position
        , 'header', header
      ) AS dict
    FROM order_item_header
  )
  , ordered_base AS (
    SELECT * FROM dict_base ORDER BY order_id, position ASC
  )
  , details AS (
    SELECT order_id, json_agg(dict) as items FROM ordered_base GROUP BY order_id
  )
  SELECT order_.*, COALESCE(details.items, '[]'::json) as items
  FROM order_
  LEFT JOIN details using(order_id)
`;

export async function getOrder(orderId: string): Promise<GetOrder> {
  let maybe_order = await _pool.query(apiOrderQuery + "WHERE order_id = $1", [orderId]);
  if (maybe_order.rowCount === 1) {
    return maybe_order.rows[0];
  } else {
    throw new NotFoundError(`Could not find order with id ${orderId}`);
  }
}

export async function getOrders(): Promise<GetOrder[]> {
  return (await _pool.query(apiOrderQuery)).rows;
}

export async function orderExists(pgClient: PoolClient | Pool, orderId: string): Promise<boolean> {
  const result = await pgClient.query(
    "SELECT EXISTS(SELECT 1 FROM order_ WHERE order_id = $1) as exists_",
    [orderId]
  );

  return result.rows[0].exists_;
}

export async function deleteOrder(orderId: string) {
  if (!(await orderExists(_pool, orderId))) {
    throw new NotFoundError(`Could not find order with id ${orderId}`);
  } else {
    await _pool.query(
      `
      WITH delete_articles as (
        DELETE FROM order_item_article WHERE order_id = $1
      )
      , delete_headers as (
        DELETE FROM order_item_header WHERE order_id = $1
      )
      DELETE FROM order_ WHERE order_id = $1
    `,
      [orderId]
    );
  }
}

async function insertOrderHeader(
  pgClient: PoolClient,
  order_id: string,
  header: ApiOrderItemHeader
) {
  await pgClient.query(
    `
    INSERT INTO order_item_header (order_id, position, header)
    VALUES ($1, $2, $3)
  `,
    [order_id, header.position, header.header]
  );
}

async function insertOrderArticle(
  pgClient: PoolClient,
  order_id: string,
  article: ApiOrderItemArticle
) {
  await pgClient.query(
    `
    INSERT INTO order_item_article (
      order_id, article_id, position, description, amount, price_per_item, discount
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `,
    [
      order_id,
      article.article_id,
      article.position,
      article.description,
      article.amount,
      article.price_per_item,
      article.discount,
    ]
  );
}
async function _saveOrder(pgClient: PoolClient, order: SaveOrder) {
  await pgClient.query(
    `
    INSERT INTO order_ (
      order_id, car_id, client_id, title, date, payment_due_date, payment_method, state,
      description, mileage
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
      order.mileage,
    ]
  );

  for (const orderItem of order.items) {
    if ("header" in orderItem) {
      await insertOrderHeader(pgClient, order.order_id, orderItem);
    } else {
      await insertOrderArticle(pgClient, order.order_id, orderItem);
    }
  }
}

export async function saveOrder(order: SaveOrder) {
  await executeWithTransaction(_saveOrder, [order]);
}

async function _editOrder(pgClient: PoolClient, orderId: string, newProperties: EditOrder) {
  if (!(await orderExists(_pool, orderId))) {
    throw new NotFoundError(`Could not find order with id ${orderId}`);
  }

  const queryArgs = Object.entries(newProperties).reduce(
    (acc, [property, value]) => {
      if (property === "items") return acc;

      acc.arguments.push(value);
      acc.query.push(`${property} = $${acc.arguments.length}`);
      return acc;
    },
    { query: [] as string[], arguments: [orderId] as any[] }
  );

  if (queryArgs.query.length) {
    await pgClient.query(
      `UPDATE order_ SET ${queryArgs.query.join(", ")} WHERE order_id = $1`,
      queryArgs.arguments
    );
  }

  if (newProperties.items) {
    await pgClient.query(`DELETE FROM order_item_article WHERE order_id = $1`, [orderId]);
    await pgClient.query(`DELETE FROM order_item_header WHERE order_id = $1`, [orderId]);

    for (const orderItem of newProperties.items) {
      if ("header" in orderItem) {
        await insertOrderHeader(pgClient, orderId, orderItem);
      } else {
        await insertOrderArticle(pgClient, orderId, orderItem);
      }
    }
  }
}

export async function editOrder(orderId: string, newProperties: EditOrder) {
  await executeWithTransaction(_editOrder, [orderId, newProperties]);
}
