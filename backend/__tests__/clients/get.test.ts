import server from "@backend/server";

import { createClient } from "@tests/factory/client";
import { createCar } from "@tests/factory/car";
import { db_cleanup } from "@tests/factory/factory";
import { getAuthHeader } from "@tests/helpers";
import { GetClient } from "@backend/interfaces/api";

describe("clients - GET", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  describe("client list", () => {
    it("returns the list of clients", async () => {
      await createClient();
      await createClient();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/clients",
      });
      const jsonResp = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(jsonResp.length).toEqual(2);
    });

    it("returns correct client properties", async () => {
      const dbClient = await createClient();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/clients",
      });

      expect(response.statusCode).toEqual(200);

      const apiClient: GetClient = JSON.parse(response.payload)[0];
      for (const key of Object.keys(dbClient)) {
        expect((dbClient as any)[key]).toEqual((apiClient as any)[key]);
      }
      expect(apiClient.cars).toEqual([]);
    });

    it("returns an empty list without errors", async () => {
      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/clients",
      });
      expect(response.payload).toEqual(JSON.stringify([]));
    });
  });

  describe("single client", () => {
    it("returns the the client", async () => {
      const car1 = await createCar();
      const car2 = await createCar();
      const ownedCarIds = [car1.car_id, car2.car_id];
      const dbClient = await createClient(ownedCarIds);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/clients/${dbClient.client_id}`,
      });

      expect(response.statusCode).toEqual(200);

      const apiClient: GetClient = JSON.parse(response.payload);
      for (const key of Object.keys(dbClient)) {
        expect((dbClient as any)[key]).toEqual((apiClient as any)[key]);
      }
      expect(new Set(apiClient.cars.map(val => val.car_id))).toEqual(new Set(ownedCarIds));
    });

    it("returns the 404 for non existing clients", async () => {
      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/clients/sth_not_existing`,
      });

      expect(response.statusCode).toEqual(404);
    });
  });
});
