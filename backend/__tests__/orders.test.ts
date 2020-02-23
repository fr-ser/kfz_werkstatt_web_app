import server from "@backend/server";
import { _pool } from "@backend/db/db";

import { DbOrder } from "@backend/interfaces/db";

import { Fixture } from "@tests/factory/factory";
import { createOrder } from "@tests/factory/order";
import { getAuthHeader } from "@tests/helpers";

describe("orders", () => {
  let factories: Fixture<DbOrder>[] = [];

  beforeAll(async () => {
    await server.ready();
  });

  afterEach(async () => {
    for (const factory of factories) {
      await factory.destroy();
    }
    factories = [];
  });

  describe("api/orders", () => {
    it("returns the list of orders", async () => {
      factories.push(await createOrder());
      factories.push(await createOrder());

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/orders",
      });
      const jsonResp = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(jsonResp.length).toEqual(2);
    });

    it("returns correct order properties", async () => {
      const order = await createOrder();
      factories.push(order);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/orders",
      });
      expect(response.payload).toEqual(JSON.stringify([order.element]));
    });
  });

  describe("api/orders/<order_id>", () => {
    it("returns the the order", async () => {
      const order = await createOrder();
      factories.push(order);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/orders/${order.element.order_id}`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.payload).toEqual(JSON.stringify(order.element));
    });

    it("returns the 404 for non existing orders", async () => {
      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/orders/sth_not_existing`,
      });

      expect(response.statusCode).toEqual(404);
    });
  });
});
