import server from "@backend/server";

import { getAuthHeader } from "@tests/helpers";
import { smartCleanup } from "@tests/factory/factory";
import { createClient } from "@tests/factory/client";
import { createCar } from "@tests/factory/car";
import { createOrder } from "@tests/factory/order";
import { clientExists } from "@tests/clients/helpers";
import { orderExists } from "@tests/orders/helpers";
import { carExists } from "@tests/cars/helpers";

describe("clients - DELETE", () => {
  beforeAll(async () => {
    await server.ready();
  });

  let cleanupCars: string[] = [];
  let cleanupClients: string[] = [];
  let cleanupOrders: string[] = [];

  afterEach(async () => {
    await smartCleanup({ cars: cleanupCars, clients: cleanupClients, orders: cleanupOrders });
    cleanupCars = [];
    cleanupClients = [];
    cleanupOrders = [];
  });

  it("deletes a client", async () => {
    const client = await createClient();

    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/clients/${client.client_id}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(await clientExists(client.client_id)).toBe(false);
  });

  it("returns 404 for missing clients", async () => {
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/clients/sth_not_right`,
    });

    expect(response.statusCode).toEqual(404);
    expect(JSON.parse(response.payload).msg).toBeTruthy();
  });

  it("returns 409 for a client with a car", async () => {
    const car = await createCar();
    cleanupCars.push(car.car_id);
    const client = await createClient([car.car_id]);
    cleanupClients.push(client.client_id);

    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/clients/${client.client_id}`,
    });

    expect(response.statusCode).toEqual(409);
    expect(JSON.parse(response.payload).msg).toBeTruthy();

    expect(await clientExists(client.client_id)).toBe(true);
    expect(await carExists(car.car_id)).toBe(true);
  });

  it("returns 409 for a client with an order", async () => {
    const client = await createClient();
    cleanupClients.push(client.client_id);
    const order = await createOrder({ clientId: client.client_id });
    cleanupOrders.push(order.order_id);

    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/clients/${client.client_id}`,
    });

    expect(response.statusCode).toEqual(409);
    expect(JSON.parse(response.payload).msg).toBeTruthy();
    expect(await clientExists(client.client_id)).toBe(true);
    expect(await orderExists(order.order_id)).toBe(true);
  });
});
