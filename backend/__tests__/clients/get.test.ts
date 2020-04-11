import server from "@backend/server";

import { createClient } from "@tests/factory/client";
import { createCar } from "@tests/factory/car";
import { smartCleanup } from "@tests/factory/factory";
import { getAuthHeader } from "@tests/helpers";
import { GetClient } from "@backend/interfaces/api";

describe("clients - GET", () => {
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

  describe("client list", () => {
    it("returns the list of clients", async () => {
      const clientList = [await createClient(), await createClient()];
      cleanupClients.push(...clientList.map((client) => client.client_id));

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/clients",
      });

      expect(response.statusCode).toEqual(200);
      const respClients: GetClient[] = JSON.parse(response.payload);
      expect(
        clientList.every((client) =>
          respClients.find((respClient) => respClient.client_id === client.client_id)
        )
      ).toBe(true);
    });

    it("returns correct client properties", async () => {
      const dbClient = await createClient();
      cleanupClients.push(dbClient.client_id);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/clients",
      });

      expect(response.statusCode).toEqual(200);

      const apiClient: GetClient = JSON.parse(response.payload).find(
        (client: GetClient) => client.client_id === dbClient.client_id
      );
      for (const key of Object.keys(dbClient)) {
        expect((dbClient as any)[key]).toEqual((apiClient as any)[key]);
      }
      expect(apiClient.cars).toEqual([]);
    });
  });

  describe("single client", () => {
    it("returns the the client", async () => {
      const car1 = await createCar();
      const car2 = await createCar();
      const ownedCarIds = [car1.car_id, car2.car_id];
      cleanupCars.push(...ownedCarIds);
      const dbClient = await createClient(ownedCarIds);
      cleanupClients.push(dbClient.client_id);

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
      expect(new Set(apiClient.cars.map((val) => val.car_id))).toEqual(new Set(ownedCarIds));
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
