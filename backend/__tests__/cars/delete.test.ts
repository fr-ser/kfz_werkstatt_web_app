import server from "@backend/server";

import { getAuthHeader } from "@tests/helpers";
import { smartCleanup } from "@tests/factory/factory";
import { createCar } from "@tests/factory/car";
import { createClient } from "@tests/factory/client";
import { createOrder } from "@tests/factory/order";
import { carExists } from "@tests/cars/helpers";
import { clientExists } from "@tests/clients/helpers";
import { orderExists } from "@tests/orders/helpers";

describe("cars - DELETE", () => {
  let cleanupCars: string[] = [];
  let cleanupClients: string[] = [];
  let cleanupOrders: string[] = [];

  afterEach(async () => {
    await smartCleanup({ cars: cleanupCars, clients: cleanupClients, orders: cleanupOrders });
    cleanupCars = [];
    cleanupClients = [];
    cleanupOrders = [];
  });

  it("deletes a car", async () => {
    const car = await createCar();

    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/cars/${car.car_id}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(await carExists(car.car_id)).toBe(false);
  });

  it("returns 404 for missing cars", async () => {
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/cars/sth_not_right`,
    });

    expect(response.statusCode).toEqual(404);
    expect(JSON.parse(response.payload).msg).toBeTruthy();
  });

  it("returns 409 for a car with an owner", async () => {
    const owner = await createClient();
    cleanupClients.push(owner.client_id);
    const car = await createCar([owner.client_id]);
    cleanupCars.push(car.car_id);

    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/cars/${car.car_id}`,
    });

    expect(response.statusCode).toEqual(409);
    expect(JSON.parse(response.payload).msg).toBeTruthy();

    expect(await clientExists(owner.client_id)).toBe(true);
    expect(await carExists(car.car_id)).toBe(true);
  });

  it("returns 409 for a car with an order", async () => {
    const car = await createCar();
    cleanupCars.push(car.car_id);
    const order = await createOrder({ carId: car.car_id });
    cleanupOrders.push(order.order_id);

    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/cars/${car.car_id}`,
    });

    expect(response.statusCode).toEqual(409);
    expect(JSON.parse(response.payload).msg).toBeTruthy();
    expect(await carExists(car.car_id)).toBe(true);
    expect(await orderExists(order.order_id)).toBe(true);
  });
});
