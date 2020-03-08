import server from "@backend/server";

import { getCars } from "@backend/db/cars";

import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createCar } from "@tests/factory/car";
import { createClient } from "../factory/client";

describe("cars - DELETE", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("deletes a car", async () => {
    const car = await createCar();

    expect(await getCars()).toHaveLength(1);
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/cars/${car.car_id}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(await getCars()).toHaveLength(0);
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
    const car = await createCar([(await createClient()).client_id]);

    expect(await getCars()).toHaveLength(1);
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/cars/${car.car_id}`,
    });

    expect(response.statusCode).toEqual(409);
    expect(JSON.parse(response.payload).msg).toBeTruthy();
    expect(await getCars()).toHaveLength(1);
  });
});
