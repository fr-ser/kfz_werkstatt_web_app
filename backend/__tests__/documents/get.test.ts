import server from "@backend/server";
import { ApiOrderItemHeader, ApiOrderItemArticle } from "@backend/interfaces/api";

import { createDocument } from "@tests/factory/document";
import { db_cleanup } from "@tests/factory/factory";
import { getAuthHeader } from "@tests/helpers";
import { createOrder, createOrderItemHeader, createOrderItemArticle } from "@tests/factory/order";
import {
  getDbDocumentOrder,
  getDbDocumentCar,
  getDbDocumentClient,
  compareDocumentOrderArticle,
  compareDocumentClient,
  compareDocumentCar,
  compareDocumentOrder,
} from "@tests/documents/helpers";

describe("documents - GET", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  describe("document list", () => {
    it("returns the list of documents", async () => {
      await createDocument();
      await createDocument();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/documents",
      });

      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.payload)).toHaveLength(2);
    });

    it("returns correct document properties", async () => {
      const order = await createOrder({ noPositions: true });
      const orderHeader = await createOrderItemHeader({ position: 1, orderId: order.order_id });
      const orderArticle = await createOrderItemArticle({ position: 2, orderId: order.order_id });
      const dbDocument = await createDocument({ orderId: order.order_id });

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/documents",
      });

      expect(response.statusCode).toBe(200);
      const apiDocument = JSON.parse(response.payload)[0];

      expect(apiDocument.document_id).toBe(dbDocument.document_id);
      expect(apiDocument.creation_date).toBe(dbDocument.creation_date);
      expect(apiDocument.type).toBe(dbDocument.type);

      const dbDocumentOrder = await getDbDocumentOrder(dbDocument.document_id);
      compareDocumentOrder(apiDocument.order, dbDocumentOrder);

      const dbDocumentCar = await getDbDocumentCar(dbDocument.document_id);
      compareDocumentCar(apiDocument.car, dbDocumentCar);

      const dbDocumentClient = await getDbDocumentClient(dbDocument.document_id);
      compareDocumentClient(apiDocument.client, dbDocumentClient);

      expect(apiDocument.items).toHaveLength(2);

      const apiHeader = apiDocument.items[0] as ApiOrderItemHeader;
      expect(apiHeader.position).toBe(orderHeader.position);
      expect(apiHeader.header).toBe(orderHeader.header);

      const apiItem = apiDocument.items[1] as ApiOrderItemArticle;
      compareDocumentOrderArticle(apiItem, orderArticle);
    });

    it("returns an empty list without errors", async () => {
      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/documents",
      });
      expect(JSON.parse(response.payload)).toEqual([]);
    });
  });

  describe("single document", () => {
    it("returns the the document", async () => {
      const order = await createOrder({ noPositions: true });
      const orderHeader = await createOrderItemHeader({ position: 1, orderId: order.order_id });
      const orderArticle = await createOrderItemArticle({ position: 2, orderId: order.order_id });
      const dbDocument = await createDocument({ orderId: order.order_id });

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/documents/${dbDocument.document_id}`,
      });

      expect(response.statusCode).toBe(200);
      const apiDocument = JSON.parse(response.payload);

      expect(apiDocument.document_id).toBe(dbDocument.document_id);
      expect(apiDocument.creation_date).toBe(dbDocument.creation_date);
      expect(apiDocument.type).toBe(dbDocument.type);

      const dbDocumentOrder = await getDbDocumentOrder(dbDocument.document_id);
      compareDocumentOrder(apiDocument.order, dbDocumentOrder);

      const dbDocumentCar = await getDbDocumentCar(dbDocument.document_id);
      compareDocumentCar(apiDocument.car, dbDocumentCar);

      const dbDocumentClient = await getDbDocumentClient(dbDocument.document_id);
      compareDocumentClient(apiDocument.client, dbDocumentClient);

      expect(apiDocument.items).toHaveLength(2);

      const apiHeader = apiDocument.items[0] as ApiOrderItemHeader;
      expect(apiHeader.position).toBe(orderHeader.position);
      expect(apiHeader.header).toBe(orderHeader.header);

      const apiItem = apiDocument.items[1] as ApiOrderItemArticle;
      compareDocumentOrderArticle(apiItem, orderArticle);
    });

    it("returns the 404 for non existing documents", async () => {
      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/documents/sth_not_existing`,
      });

      expect(response.statusCode).toEqual(404);
    });
  });
});
