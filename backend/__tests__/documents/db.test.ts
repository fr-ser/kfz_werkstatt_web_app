import { NotFoundError, BusinessConstraintError } from "@backend/common";
import { getDocument, getDocuments, deleteDocument, saveDocument } from "@backend/db/documents";
import { DbDocumentType, DbDocumentOrder } from "@backend/interfaces/db";
import { ApiOrderItemArticle, ApiOrderItemHeader } from "@backend/interfaces/api";

import { createDocument } from "@tests/factory/document";
import { db_cleanup } from "@tests/factory/factory";
import {
  getDocumentCount,
  getDbDocument,
  getDocumentCarCount,
  getDocumentClientCount,
  getDocumentOrderCount,
  getDocumentOrderArticleCount,
  getDocumentOrderHeaderCount,
  getDbDocumentCar,
  getDbDocumentClient,
  getDbDocumentHeaders,
  getDbDocumentArticles,
  getDbDocumentOrder,
  compareDocumentOrderArticle,
  compareDocumentCar,
  compareDocumentClient,
  compareDocumentOrder,
} from "@tests/documents/helpers";
import { createOrder, createOrderItemHeader, createOrderItemArticle } from "@tests/factory/order";
import { createCar } from "@tests/factory/car";
import { createClient } from "@tests/factory/client";
import { getDateStr } from "@tests/helpers";

describe("documents - database queries", () => {
  beforeEach(async () => {
    await db_cleanup();
  });

  describe("getDocument", () => {
    it("returns the document", async () => {
      const order = await createOrder({ noPositions: true });
      const orderHeader = await createOrderItemHeader({ position: 1, orderId: order.order_id });
      const orderArticle = await createOrderItemArticle({ position: 2, orderId: order.order_id });
      const dbDocument = await createDocument({ orderId: order.order_id });

      const apiDocument = await getDocument(dbDocument.document_id);

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

    it("throws the NotFoundError if no document exists", async () => {
      try {
        await getDocument("not_existing");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("getDocuments", () => {
    it("returns an empty list for no documents", async () => {
      expect(await getDocuments()).toEqual([]);
    });

    it("returns all documents", async () => {
      const dbDocuments = [await createDocument(), await createDocument()].sort((a, b) =>
        a.document_id > b.document_id ? -1 : 1
      );

      const apiDocuments = (await getDocuments()).sort((a, b) =>
        a.document_id > b.document_id ? -1 : 1
      );

      expect(apiDocuments).toHaveLength(dbDocuments.length);

      for (let idx = 0; idx < apiDocuments.length; idx++) {
        const apiDocument = apiDocuments[idx];
        const dbDocument = dbDocuments[idx];

        expect(apiDocument.document_id).toBe(dbDocument.document_id);
        expect(apiDocument.creation_date).toBe(dbDocument.creation_date);
        expect(apiDocument.type).toBe(dbDocument.type);

        const dbDocumentOrder = await getDbDocumentOrder(dbDocument.document_id);
        compareDocumentOrder(apiDocument.order, dbDocumentOrder);

        const dbDocumentCar = await getDbDocumentCar(dbDocument.document_id);
        compareDocumentCar(apiDocument.car, dbDocumentCar);

        const dbDocumentClient = await getDbDocumentClient(dbDocument.document_id);
        compareDocumentClient(apiDocument.client, dbDocumentClient);

        expect(apiDocument.items.length).toBeGreaterThan(0);
      }
    });
  });

  describe("deleteDocument", () => {
    it("deletes a document", async () => {
      const dbDocument = await createDocument();

      expect(await getDocumentCount()).toBe(1);

      await deleteDocument(dbDocument.document_id);

      expect(await getDocumentCount()).toBe(0);
      expect(await getDocumentCarCount()).toBe(0);
      expect(await getDocumentClientCount()).toBe(0);
      expect(await getDocumentOrderCount()).toBe(0);
      expect(await getDocumentOrderArticleCount()).toBe(0);
      expect(await getDocumentOrderHeaderCount()).toBe(0);
    });

    it("throws the NotFoundError, if the document does not exist", async () => {
      try {
        await deleteDocument("not_existing");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("saveDocument", () => {
    it("saves a document with order items", async () => {
      const documentId = "sth";
      const car = await createCar();
      const client = await createClient();
      const order = await createOrder({
        carId: car.car_id,
        clientId: client.client_id,
        noPositions: true,
      });
      const header = await createOrderItemHeader({ position: 1, orderId: order.order_id });
      const articles = [
        await createOrderItemArticle({ position: 2, orderId: order.order_id }),
        await createOrderItemArticle({ position: 3, orderId: order.order_id }),
      ];

      const payload = {
        document_id: documentId,
        type: DbDocumentType.invoice,
        order_id: order.order_id,
        client_id: order.client_id,
        car_id: order.car_id,
      };
      await saveDocument(payload);

      const dbDocument = await getDbDocument(documentId);
      expect(dbDocument.document_id).toBe(documentId);
      expect(dbDocument.type).toBe(DbDocumentType.invoice);
      expect(dbDocument.creation_date).toBe(getDateStr(new Date()));
      expect(dbDocument.order_id).toBe(payload.order_id);

      const dbDocumentOrder = await getDbDocumentOrder(documentId);
      expect(dbDocumentOrder.document_id).toBe(documentId);
      compareDocumentOrder(dbDocumentOrder, order);

      const dbDocumentCar = await getDbDocumentCar(documentId);
      expect(dbDocumentCar.document_id).toBe(documentId);
      compareDocumentCar(dbDocumentCar, car);

      const dbDocumentClient = await getDbDocumentClient(documentId);
      expect(dbDocumentClient.document_id).toBe(documentId);
      compareDocumentClient(dbDocumentClient, client);

      expect(await getDocumentOrderHeaderCount()).toBe(1);
      const dbDocumentHeader = (await getDbDocumentHeaders(documentId))[0];
      expect(dbDocumentHeader.document_id).toBe(documentId);
      expect(dbDocumentHeader.position).toBe(header.position);
      expect(dbDocumentHeader.header).toBe(header.header);

      expect(await getDocumentOrderArticleCount()).toBe(2);
      const dbArticles = await getDbDocumentArticles(documentId);
      for (let idx = 0; idx < articles.length; idx++) {
        const dbArticle = dbArticles[idx];
        const article = articles[idx];

        expect(dbArticle.document_id).toBe(documentId);
        compareDocumentOrderArticle(dbArticle, article);
      }
    });

    it("saves a document without headers", async () => {
      const documentId = "sth";
      const order = await createOrder({ noPositions: true });
      await createOrderItemArticle({ orderId: order.order_id });

      const payload = {
        document_id: documentId,
        type: DbDocumentType.invoice,
        order_id: order.order_id,
        client_id: order.client_id,
        car_id: order.car_id,
      };
      await saveDocument(payload);

      expect(await getDocumentCount()).toBe(1);
      expect(await getDocumentCarCount()).toBe(1);
      expect(await getDocumentClientCount()).toBe(1);
      expect(await getDocumentOrderCount()).toBe(1);
      expect(await getDocumentOrderHeaderCount()).toBe(0);
      expect(await getDocumentOrderArticleCount()).toBe(1);
    });

    it("throws an error if the document cannot be saved", async () => {
      const order = await createOrder({ noPositions: true });

      try {
        const payload = {
          document_id: "sth",
          type: DbDocumentType.invoice,
          order_id: order.order_id,
          client_id: order.client_id,
          car_id: order.car_id,
        };
        await saveDocument(payload);
      } catch (error) {
        return;
      }
      fail("nothing thrown");
    });

    it("throws an error if there are no articles", async () => {
      try {
        await saveDocument({} as any);
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessConstraintError);
        return;
      }
      fail("nothing thrown");
    });
  });
});
