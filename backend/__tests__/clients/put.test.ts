import server from "@backend/server";

import { getCarsOfClient, getDbClient } from "@tests/clients/helpers";
import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createClient } from "@tests/factory/client";
import { createCar } from "@tests/factory/car";

describe("clients - PUT", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("edits a client", async () => {
    const car = await createCar();
    const client = await createClient([(await createCar()).car_id]);

    const response = await server.inject({
      method: "PUT",
      headers: { ...getAuthHeader() },
      url: `/api/clients/${(await client).client_id}`,
      payload: {
        first_name: "Esteban",
        zip_code: 12345,
        birthday: "1990-12-31",
        car_ids: [car.car_id],
      },
    });

    expect(response.statusCode).toEqual(200);
    const dbClient = await getDbClient(client.client_id);
    expect(dbClient.first_name).toEqual("Esteban");
    expect(dbClient.zip_code).toEqual(12345);
    expect(dbClient.birthday).toEqual("1990-12-31");
    expect(await getCarsOfClient(client.client_id)).toEqual(new Set([car.car_id]));
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
