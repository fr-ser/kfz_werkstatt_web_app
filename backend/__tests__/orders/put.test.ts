import server from "@backend/server";

import { getDbOrder, getDbOrderArticles, getOrderItemsCount } from "@tests/orders/helpers";
import { getAuthHeader } from "@tests/helpers";
import { createOrder, createOrderItemHeader } from "@tests/factory/order";
import { createCar } from "@tests/factory/car";
import { createClient } from "@tests/factory/client";

describe("orders - PUT", () => {
  beforeAll(async () => {
    await server.ready();
  });

  it("edits an order", async () => {
    const order = await createOrder();
    await createOrderItemHeader({ orderId: order.order_id });

    const payload = {
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
        {
          position: 1,
          article_id: "AYZ_3",
          description: "Regular work per hour",
          amount: 1.2,
          price_per_item: 22.33,
          discount: 0.1,
        },
      ],
    };

    const response = await server.inject({
      method: "PUT",
      headers: { ...getAuthHeader() },
      url: `/api/orders/${order.order_id}`,
      payload,
    });

    expect(response.statusCode).toEqual(200);

    const dbOrder = await getDbOrder(order.order_id);
    for (const key of Object.keys(payload)) {
      if (key === "items") continue;

      expect((dbOrder as any)[key]).toEqual((payload as any)[key]);
    }

    expect(await getOrderItemsCount(order.order_id)).toBe(1);

    const orderArticles = await getDbOrderArticles(order.order_id);
    expect(orderArticles).toHaveLength(1);
    expect(orderArticles[0].position).toBe(payload.items[0].position);
    expect(orderArticles[0].article_id).toBe(payload.items[0].article_id);
    expect(orderArticles[0].description).toBe(payload.items[0].description);
    expect(orderArticles[0].amount).toBe(payload.items[0].amount);
    expect(orderArticles[0].price_per_item).toBe(payload.items[0].price_per_item);
    expect(orderArticles[0].discount).toBe(payload.items[0].discount);
  });

  const invalidPayloads = [
    {},
    { some: "weird_stuff" },
    { order_id: "Auf1" },
    { description: "Julio", some: "valid and invalid" },
    {
      items: [
        {
          position: 1,
          article_id: "AYZ_3",
          description: "Regular work per hour",
          amount: -1.2,
          price_per_item: 22.33,
          discount: 0.1,
        },
      ],
    },
    {
      items: [
        { position: 2, header: "sth_valid" },
        {
          position: 1,
          article_id: "AYZ_3",
          description: "Regular work per hour",
          amount: 1.2,
          price_per_item: 22.33,
          discount: 1.1,
        },
      ],
    },
  ];
  for (const payload of invalidPayloads) {
    it(`returns 400 for ${JSON.stringify(payload)}`, async () => {
      const order = createOrder();
      const response = await server.inject({
        method: "PUT",
        headers: { ...getAuthHeader() },
        url: `/api/orders/${(await order).order_id}`,
        payload,
      });

      expect(response.statusCode).toEqual(400);
    });
  }
});
