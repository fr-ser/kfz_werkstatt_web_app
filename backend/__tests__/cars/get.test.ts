import server from "@backend/server";

import { createCar } from "@tests/factory/car";
import { smartCleanup } from "@tests/factory/factory";
import { getAuthHeader } from "@tests/helpers";
import { GetCar } from "@backend/interfaces/api";
import { createClient } from "../factory/client";

describe("cars - GET", () => {
  beforeAll(async () => {
    await server.ready();
  });

  let cleanupCars: string[] = [];
  let cleanupClients: string[] = [];

  afterEach(async () => {
    await smartCleanup({ cars: cleanupCars, clients: cleanupClients });
    cleanupCars = [];
    cleanupClients = [];
  });

  describe("car list", () => {
    it("returns the list of cars", async () => {
      const carList = [await createCar(), await createCar()];
      cleanupCars.push(...carList.map((car) => car.car_id));

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/cars",
      });
      expect(response.statusCode).toEqual(200);

      const respCars: GetCar[] = JSON.parse(response.payload);

      expect(
        carList.every((car) => respCars.find((respCar) => respCar.car_id === car.car_id))
      ).toBe(true);
    });

    it("returns correct car properties", async () => {
      const dbCar = await createCar();
      cleanupCars.push(dbCar.car_id);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/cars",
      });

      expect(response.statusCode).toEqual(200);

      const apiCar = JSON.parse(response.payload).find(
        (car: GetCar) => car.car_id === dbCar.car_id
      );
      for (const key of Object.keys(dbCar)) {
        expect(apiCar[key]).toEqual((dbCar as any)[key]);
      }
      expect(apiCar.owners).toEqual([]);
    });
  });

  describe("single car", () => {
    it("returns the the car", async () => {
      const owner1 = await createClient();
      const owner2 = await createClient();
      const carOwnerIds = [owner1.client_id, owner2.client_id];
      cleanupClients.push(...carOwnerIds);
      const dbCar = await createCar(carOwnerIds);
      cleanupCars.push(dbCar.car_id);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/cars/${dbCar.car_id}`,
      });

      expect(response.statusCode).toEqual(200);

      const apiCar = JSON.parse(response.payload);
      for (const key of Object.keys(dbCar)) {
        expect((dbCar as any)[key]).toEqual(apiCar[key]);
      }
      expect(new Set((apiCar as GetCar).owners.map((val) => val.client_id))).toEqual(
        new Set(carOwnerIds)
      );
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
