import { test_pool } from "@tests/factory/factory";
import {
  DbDocument,
  DbDocumentCar,
  DbDocumentClient,
  DbDocumentOrderHeader,
  DbDocumentOrderArticle,
  DbDocumentOrder,
} from "@backend/interfaces/db";

export async function getDocumentOrderHeaderCount(documentId: string): Promise<number> {
  const result = await test_pool.query(
    "SELECT count(*)::INTEGER as count_ FROM document_order_item_header WHERE document_id = $1",
    [documentId]
  );
  return result.rows[0].count_;
}

export async function getDocumentOrderArticleCount(documentId: string): Promise<number> {
  const result = await test_pool.query(
    "SELECT count(*)::INTEGER as count_ FROM document_order_item_article WHERE document_id = $1",
    [documentId]
  );
  return result.rows[0].count_;
}

export async function documentExists(documentId: string): Promise<boolean> {
  const result = await test_pool.query(
    `SELECT EXISTS(SELECT 1 FROM document WHERE document_id = $1) as exists_`,
    [documentId]
  );
  return result.rows[0].exists_;
}

export async function documentCarExists(documentId: string): Promise<boolean> {
  const result = await test_pool.query(
    `SELECT EXISTS(SELECT 1 FROM document_car WHERE document_id = $1) as exists_`,
    [documentId]
  );
  return result.rows[0].exists_;
}

export async function documentClientExists(documentId: string): Promise<boolean> {
  const result = await test_pool.query(
    `SELECT EXISTS(SELECT 1 FROM document_client WHERE document_id = $1) as exists_`,
    [documentId]
  );
  return result.rows[0].exists_;
}

export async function documentOrderExists(documentId: string): Promise<boolean> {
  const result = await test_pool.query(
    `SELECT EXISTS(SELECT 1 FROM document_order WHERE document_id = $1) as exists_`,
    [documentId]
  );
  return result.rows[0].exists_;
}

export async function getDbDocument(documentId: string): Promise<DbDocument> {
  const result = await test_pool.query(`SELECT * FROM document WHERE document_id = $1`, [
    documentId,
  ]);
  return result.rows[0];
}

export async function getDbDocumentOrder(documentId: string): Promise<DbDocumentOrder> {
  const result = await test_pool.query(`SELECT * FROM document_order WHERE document_id = $1`, [
    documentId,
  ]);
  return result.rows[0];
}
export async function getDbDocumentCar(documentId: string): Promise<DbDocumentCar> {
  const result = await test_pool.query(`SELECT * FROM document_car WHERE document_id = $1`, [
    documentId,
  ]);
  return result.rows[0];
}

export async function getDbDocumentClient(documentId: string): Promise<DbDocumentClient> {
  const result = await test_pool.query(`SELECT * FROM document_client WHERE document_id = $1`, [
    documentId,
  ]);
  return result.rows[0];
}

export async function getDbDocumentHeaders(documentId: string): Promise<DbDocumentOrderHeader[]> {
  const result = await test_pool.query(
    `SELECT * FROM document_order_item_header WHERE document_id = $1`,
    [documentId]
  );
  return result.rows;
}

export async function getDbDocumentArticles(
  documentId: string
): Promise<DbDocumentOrderArticle[]> {
  const result = await test_pool.query(
    `SELECT * FROM document_order_item_article WHERE document_id = $1`,
    [documentId]
  );
  return result.rows;
}

export function compareDocumentOrderArticle(
  article: Omit<DbDocumentOrderArticle, "id" | "document_id">,
  expectedArticle: Omit<DbDocumentOrderArticle, "id" | "document_id">
) {
  expect(article.position).toBe(expectedArticle.position);
  expect(article.article_id).toEqual(expectedArticle.article_id);
  expect(article.description).toEqual(expectedArticle.description);
  expect(article.amount).toEqual(expectedArticle.amount);
  expect(article.price_per_item).toEqual(expectedArticle.price_per_item);
  expect(article.discount).toEqual(expectedArticle.discount);
}

export function compareDocumentOrder(
  order: Omit<DbDocumentOrder, "id" | "document_id">,
  expectedOrder: Omit<DbDocumentOrder, "id" | "document_id">
) {
  expect(order.date).toBe(expectedOrder.date);
  expect(order.mileage).toBe(expectedOrder.mileage);
  expect(order.payment_due_date).toBe(expectedOrder.payment_due_date);
  expect(order.payment_method).toBe(expectedOrder.payment_method);
  expect(order.title).toBe(expectedOrder.title);
}

export function compareDocumentCar(
  car: Omit<DbDocumentCar, "id" | "document_id">,
  expectedCar: Omit<DbDocumentCar, "id" | "document_id">
) {
  expect(car.license_plate).toBe(expectedCar.license_plate);
  expect(car.manufacturer).toBe(expectedCar.manufacturer);
  expect(car.model).toBe(expectedCar.model);
  expect(car.vin).toBe(expectedCar.vin);
}

export function compareDocumentClient(
  client: Omit<DbDocumentClient, "id" | "document_id">,
  expectedClient: Omit<DbDocumentClient, "id" | "document_id">
) {
  expect(client.client_id).toBe(expectedClient.client_id);
  expect(client.first_name).toBe(expectedClient.first_name);
  expect(client.last_name).toBe(expectedClient.last_name);
  expect(client.company_name).toBe(expectedClient.company_name);
  expect(client.city).toBe(expectedClient.city);
  expect(client.zip_code).toBe(expectedClient.zip_code);
  expect(client.street_and_number).toBe(expectedClient.street_and_number);
}
