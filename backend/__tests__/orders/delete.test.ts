import server from "@backend/server";

import { getOrders } from "@backend/db/orders";

import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createOrder, createOrderItemArticle, createOrderItemHeader } from "@tests/factory/order";

describe("orders - DELETE", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("deletes an order with details", async () => {
    const order = await createOrder();
    createOrderItemArticle({ orderId: order.order_id });
    createOrderItemHeader({ orderId: order.order_id });

    expect(await getOrders()).toHaveLength(1);
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/orders/${order.order_id}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(await getOrders()).toHaveLength(0);
  });

  it("returns 404 for missing orders", async () => {
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/orders/sth_not_right`,
    });

    expect(response.statusCode).toEqual(404);
    expect(JSON.parse(response.payload).msg).toBeTruthy();
  });
});
