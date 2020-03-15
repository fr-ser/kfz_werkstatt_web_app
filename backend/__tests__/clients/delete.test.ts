import server from "@backend/server";

import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createClient } from "@tests/factory/client";
import { createCar } from "@tests/factory/car";
import { createOrder } from "@tests/factory/order";
import { getClientCount } from "./helpers";
import { getOrderCount } from "../orders/helpers";
import { getCarCount } from "../cars/helpers";

describe("clients - DELETE", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("deletes a client", async () => {
    const client = await createClient();

    expect(await getClientCount()).toBe(1);
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/clients/${client.client_id}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(await getClientCount()).toBe(0);
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
    const client = await createClient([car.car_id]);

    expect(await getClientCount()).toBe(1);
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/clients/${client.client_id}`,
    });

    expect(response.statusCode).toEqual(409);
    expect(JSON.parse(response.payload).msg).toBeTruthy();
    expect(await getClientCount()).toBe(1);
    expect(await getCarCount()).toBe(1);
  });

  it("returns 409 for a client with a car", async () => {
    const client = await createClient();
    await createOrder({ clientId: client.client_id });

    expect(await getClientCount()).toBe(1);
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/clients/${client.client_id}`,
    });

    expect(response.statusCode).toEqual(409);
    expect(JSON.parse(response.payload).msg).toBeTruthy();
    expect(await getClientCount()).toBe(1);
    expect(await getOrderCount()).toBe(1);
  });
});
