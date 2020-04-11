import server from "@backend/server";

import { getAuthHeader } from "@tests/helpers";
import { createOrder, createOrderItemArticle, createOrderItemHeader } from "@tests/factory/order";
import { orderExists } from "@tests/orders/helpers";

describe("orders - DELETE", () => {
  beforeAll(async () => {
    await server.ready();
  });

  it("deletes an order with details", async () => {
    const order = await createOrder();
    await createOrderItemArticle({ orderId: order.order_id });
    await createOrderItemHeader({ orderId: order.order_id });

    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/orders/${order.order_id}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(await orderExists(order.order_id)).toBe(false);
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
