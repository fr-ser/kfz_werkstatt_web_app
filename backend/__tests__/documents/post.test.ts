import server from "@backend/server";

import {
  getDbDocument,
  getDbDocumentOrder,
  compareDocumentOrder,
  getDbDocumentCar,
  compareDocumentCar,
  getDbDocumentClient,
  compareDocumentClient,
  getDocumentOrderHeaderCount,
  getDocumentOrderArticleCount,
} from "@tests/documents/helpers";
import { getAuthHeader, getDateStr } from "@tests/helpers";
import { createDocument } from "@tests/factory/document";
import { createOrder, createOrderItemHeader } from "@tests/factory/order";
import { getDbCar } from "@tests/cars/helpers";
import { getDbClient } from "@tests/clients/helpers";
import { getOrderItemsCount } from "@tests/orders/helpers";

describe("documents - POST", () => {
  beforeAll(async () => {
    await server.ready();
  });

  it("creates a document for a valid payload", async () => {
    const order = await createOrder();

    const payload = {
      document_id: "R123",
      type: "invoice",
      order_id: order.order_id,
      client_id: order.client_id,
      car_id: order.car_id,
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/documents`,
      payload,
    });

    expect(response.statusCode).toEqual(201);

    const dbDocument = await getDbDocument(payload.document_id);
    expect(dbDocument.document_id).toBe(payload.document_id);
    expect(dbDocument.creation_date).toBe(getDateStr(new Date()));
    expect(dbDocument.type).toBe(payload.type);

    const dbDocumentOrder = await getDbDocumentOrder(dbDocument.document_id);
    compareDocumentOrder(order, dbDocumentOrder);

    const dbDocumentCar = await getDbDocumentCar(dbDocument.document_id);
    compareDocumentCar(dbDocumentCar, await getDbCar(order.car_id));

    const dbDocumentClient = await getDbDocumentClient(dbDocument.document_id);
    compareDocumentClient(dbDocumentClient, await getDbClient(order.client_id));

    expect(await getOrderItemsCount(order.order_id)).toBe(
      (await getDocumentOrderHeaderCount(payload.document_id)) +
        (await getDocumentOrderArticleCount(payload.document_id))
    );
  });

  it("returns 422 for database errors (duplicate key)", async () => {
    const existingDocument = await createDocument();
    const order = await createOrder();

    const payload = {
      document_id: existingDocument.document_id,
      type: "invoice",
      order_id: order.order_id,
      client_id: order.client_id,
      car_id: order.car_id,
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/documents`,
      payload,
    });

    expect(response.statusCode).toEqual(422);
  });

  it("returns 422 for an order without articles", async () => {
    const order = await createOrder({ noPositions: true });
    await createOrderItemHeader({ orderId: order.order_id });

    const payload = {
      document_id: "sth_new",
      type: "invoice",
      order_id: order.order_id,
      client_id: order.client_id,
      car_id: order.car_id,
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/documents`,
      payload,
    });

    expect(response.statusCode).toEqual(422);
  });

  describe("invalid payload", () => {
    const validPayload = {
      document_id: "sth_id",
      type: "invoice",
      order_id: "Auf123",
      client_id: "K123",
      car_id: "A123",
    };
    const invalidPayloads = [
      {},
      { some: "weird stuff" },
      { ...validPayload, some: "valid and invalid stuff" },
      { ...validPayload, type: "yesterday" },
    ];
    for (const payload of invalidPayloads) {
      it(`returns 400 for ${JSON.stringify(payload)}`, async () => {
        const response = await server.inject({
          method: "POST",
          headers: { ...getAuthHeader() },
          url: `/api/documents`,
          payload,
        });

        expect(response.statusCode).toEqual(400);
      });
    }

    const requiredProperties = ["document_id", "type", "order_id", "client_id", "car_id"];
    for (const property of requiredProperties) {
      it(`returns 400 for missing ${property}`, async () => {
        const payload: any = { ...validPayload };
        delete payload[property];

        const response = await server.inject({
          method: "POST",
          headers: { ...getAuthHeader() },
          url: `/api/documents`,
          payload,
        });

        expect(response.statusCode).toEqual(400);
      });
    }
  });
});
