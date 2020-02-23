import server from "@backend/server";
import { _pool } from "@backend/db/db";

import { DbCar } from "@backend/interfaces/db";

import { getAuthHeader } from "@tests/helpers";
import { Fixture } from "@tests/factory/factory";
import { createCar } from "@tests/factory/car";

describe("cars", () => {
  let factories: Fixture<DbCar>[] = [];

  beforeAll(async () => {
    await server.ready();
  });

  afterEach(async () => {
    for (const factory of factories) {
      await factory.destroy();
    }
    factories = [];
  });

  describe("api/cars", () => {
    it("returns the list of cars", async () => {
      factories.push(await createCar());
      factories.push(await createCar());

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/cars",
      });
      const jsonResp = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(jsonResp.length).toEqual(2);
    });

    it("returns correct car properties", async () => {
      const car = await createCar();
      factories.push(car);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/cars",
      });
      expect(response.payload).toEqual(JSON.stringify([car.element]));
    });
  });

  describe("api/cars/<car_id>", () => {
    it("returns the the car", async () => {
      const car = await createCar();
      factories.push(car);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/cars/${car.element.car_id}`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.payload).toEqual(JSON.stringify(car.element));
    });

    it("returns the 404 for non existing cars", async () => {
      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/cars/sth_not_existing`,
      });

      expect(response.statusCode).toEqual(404);
    });
  });
});
