import server from "@backend/server";

import { createCar } from "@tests/factory/car";
import { db_cleanup } from "@tests/factory/factory";
import { getAuthHeader } from "@tests/helpers";
import { GetCar } from "@backend/interfaces/api";
import { createClient } from "../factory/client";

describe("cars - GET", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  describe("car list", () => {
    it("returns the list of cars", async () => {
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
      const dbCar = await createCar();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/cars",
      });

      expect(response.statusCode).toEqual(200);

      const apiCar: GetCar = JSON.parse(response.payload)[0];
      for (const key of Object.keys(dbCar)) {
        expect((dbCar as any)[key]).toEqual((apiCar as any)[key]);
      }
      expect(apiCar.owners).toEqual([]);
    });

    it("returns an empty list without errors", async () => {
      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/cars",
      });
      expect(response.payload).toEqual(JSON.stringify([]));
    });
  });

  describe("single car", () => {
    it("returns the the car", async () => {
      const owner1 = await createClient();
      const owner2 = await createClient();
      const ownedCarIds = [owner1.client_id, owner2.client_id];
      const dbCar = await createCar(ownedCarIds);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/cars/${dbCar.car_id}`,
      });

      expect(response.statusCode).toEqual(200);

      const apiCar: GetCar = JSON.parse(response.payload);
      for (const key of Object.keys(dbCar)) {
        expect((dbCar as any)[key]).toEqual((apiCar as any)[key]);
      }
      expect(new Set(apiCar.owners.map(val => val.client_id))).toEqual(new Set(ownedCarIds));
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
