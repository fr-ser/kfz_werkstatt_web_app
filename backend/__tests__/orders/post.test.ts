import server from "@backend/server";

import {
  getDbOrder,
  getOrderCount,
  getOrderItemsCount,
  getDbOrderArticles,
  getDbOrderHeaders,
} from "@tests/orders/helpers";
import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createOrder } from "@tests/factory/order";
import { createCar } from "@tests/factory/car";
import { createClient } from "@tests/factory/client";

describe("orders - POST", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("creates an order for a valid payload", async () => {
    const payload = {
      order_id: "Auf123",
      car_id: (await createCar()).car_id,
      client_id: (await createClient()).client_id,
      title: "Repair 213",
      date: "2020-12-12",
      payment_due_date: "2020-12-31",
      payment_method: "cash",
      state: "cancelled",
      mileage: 123.44,
      description: "some lengthy description",
      items: [
        { position: 1, header: "Title of invoice" },
        {
          position: 2,
          article_id: "AYZ_3",
          description: "Regular work per hour",
          amount: 1.2,
          price_per_item: 22.33,
          discount: 0.1,
        },
      ],
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/orders`,
      payload,
    });

    expect(response.statusCode).toEqual(201);
    expect(await getOrderCount()).toBe(1);
    expect(await getOrderItemsCount()).toBe(2);

    const dbOrder = await getDbOrder(payload.order_id);
    for (const key of Object.keys(payload)) {
      if (key === "items") continue;

      expect((dbOrder as any)[key]).toEqual((payload as any)[key]);
    }

    const orderHeaders = await getDbOrderHeaders(payload.order_id);
    expect(orderHeaders).toHaveLength(1);
    expect(orderHeaders[0].position).toBe(payload.items[0].position);
    expect(orderHeaders[0].header).toBe(payload.items[0].header);

    const orderArticles = await getDbOrderArticles(payload.order_id);
    expect(orderArticles).toHaveLength(1);
    expect(orderArticles[0].position).toBe(payload.items[1].position);
    expect(orderArticles[0].article_id).toBe(payload.items[1].article_id);
    expect(orderArticles[0].description).toBe(payload.items[1].description);
    expect(orderArticles[0].amount).toBe(payload.items[1].amount);
    expect(orderArticles[0].price_per_item).toBe(payload.items[1].price_per_item);
    expect(orderArticles[0].discount).toBe(payload.items[1].discount);
  });

  it("creates an order for a minimal payload", async () => {
    const payload = {
      order_id: "Auf123",
      car_id: (await createCar()).car_id,
      client_id: (await createClient()).client_id,
      title: "Repair 213",
      date: "2020-12-12",
      payment_due_date: "2020-12-31",
      payment_method: "cash",
      state: "cancelled",
      items: [],
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/orders`,
      payload,
    });

    expect(response.statusCode).toEqual(201);
    expect(await getOrderCount()).toBe(1);
    expect(await getOrderItemsCount()).toBe(0);

    const dbOrder = await getDbOrder(payload.order_id);
    for (const key of Object.keys(payload)) {
      if (key === "items") continue;

      expect((dbOrder as any)[key]).toEqual((payload as any)[key]);
    }
  });

  it("returns 422 for database errors (duplicate key)", async () => {
    const existingOrder = await createOrder();

    const payload = {
      order_id: existingOrder.order_id,
      car_id: (await createCar()).car_id,
      client_id: (await createClient()).client_id,
      title: "Repair 213",
      date: "2020-12-12",
      payment_due_date: "2020-12-31",
      payment_method: "cash",
      state: "cancelled",
      items: [],
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/orders`,
      payload,
    });

    expect(response.statusCode).toEqual(422);
    expect(await getOrderCount()).toBe(1);
  });

  describe("invalid payload", () => {
    const validPayload = {
      order_id: "Auf123",
      car_id: "A123",
      client_id: "K123",
      title: "Repair 213",
      date: "2020-12-12",
      payment_due_date: "2020-12-31",
      payment_method: "cash",
      state: "cancelled",
      items: [],
    };

    const invalidPayloads = [
      {},
      { some: "weird stuff" },
      { ...validPayload, some: "valid and invalid stuff" },
      { ...validPayload, order_id: "Aufinvalid_id" },
      { ...validPayload, car_id: "K1234" },
      { ...validPayload, mileage: -1 },
      { ...validPayload, date: "yesterday" },
      { ...validPayload, payment_method: "coins" },
      { ...validPayload, state: "disarray" },
      { ...validPayload, items: [{ position: 1 }] },
      { ...validPayload, items: [{ position: 1, heading: "should be header" }] },
      { ...validPayload, items: [{ position: 1, header: "a", price_per_item: 2 }] },
      { ...validPayload, items: [{ position: 1, price_per_item: 2 }] },
    ];
    for (const payload of invalidPayloads) {
      it(`returns 400 for ${JSON.stringify(payload)}`, async () => {
        const response = await server.inject({
          method: "POST",
          headers: { ...getAuthHeader() },
          url: `/api/orders`,
          payload,
        });

        expect(response.statusCode).toEqual(400);
        expect(await getOrderCount()).toBe(0);
      });
    }

    const requiredProperties = [
      "order_id",
      "car_id",
      "client_id",
      "title",
      "date",
      "payment_due_date",
      "payment_method",
      "state",
      "items",
    ];
    for (const property of requiredProperties) {
      it(`returns 400 for missing ${property}`, async () => {
        const payload: any = { ...validPayload };
        delete payload[property];

        const response = await server.inject({
          method: "POST",
          headers: { ...getAuthHeader() },
          url: `/api/orders`,
          payload,
        });

        expect(response.statusCode).toEqual(400);
        expect(await getOrderCount()).toBe(0);
      });
    }
  });
});
