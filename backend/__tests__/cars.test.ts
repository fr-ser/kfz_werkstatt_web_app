import server from "@backend/server";
import { _pool } from "@backend/db/db";

import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createCar } from "@tests/factory/car";

describe("cars", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  describe("api/cars", () => {
    it("returns the list of cars", async () => {
      await db_cleanup();

      await createCar();
      await createCar();

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

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/cars",
      });
      expect(response.payload).toEqual(JSON.stringify([car]));
    });
  });

  describe("api/cars/<car_id>", () => {
    it("returns the the car", async () => {
      const car = await createCar();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/cars/${car.car_id}`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.payload).toEqual(JSON.stringify(car));
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
