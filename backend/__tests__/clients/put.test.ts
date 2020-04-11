import server from "@backend/server";

import { getCarsOfClient, getDbClient } from "@tests/clients/helpers";
import { getAuthHeader } from "@tests/helpers";
import { smartCleanup } from "@tests/factory/factory";
import { createClient } from "@tests/factory/client";
import { createCar } from "@tests/factory/car";

describe("clients - PUT", () => {
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

  it("edits a client", async () => {
    const oldCar = await createCar();
    const newCar = await createCar();
    cleanupCars.push(oldCar.car_id, newCar.car_id);
    const client = await createClient([oldCar.car_id]);
    cleanupClients.push(client.client_id);

    const response = await server.inject({
      method: "PUT",
      headers: { ...getAuthHeader() },
      url: `/api/clients/${client.client_id}`,
      payload: {
        first_name: "Esteban",
        zip_code: 12345,
        birthday: "1990-12-31",
        car_ids: [newCar.car_id],
      },
    });

    expect(response.statusCode).toEqual(200);
    const dbClient = await getDbClient(client.client_id);
    expect(dbClient.first_name).toEqual("Esteban");
    expect(dbClient.zip_code).toEqual(12345);
    expect(dbClient.birthday).toEqual("1990-12-31");
    expect(await getCarsOfClient(client.client_id)).toEqual(new Set([newCar.car_id]));
  });

  const invalidPayloads = [
    {},
    { some: "weird_stuff" },
    { client_id: "K1" },
    { first_name: "Julio", some: "valid and invalid" },
  ];
  for (const payload of invalidPayloads) {
    it(`returns 400 for ${JSON.stringify(payload)}`, async () => {
      const client = createClient();
      cleanupClients.push((await client).client_id);

      const response = await server.inject({
        method: "PUT",
        headers: { ...getAuthHeader() },
        url: `/api/clients/${(await client).client_id}`,
        payload,
      });

      expect(response.statusCode).toEqual(400);
    });
  }
});
