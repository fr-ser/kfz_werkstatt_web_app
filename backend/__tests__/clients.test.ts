import server from "@backend/server";
import { _pool } from "@backend/db/db";

import { getAuthHeader } from "@tests/helpers";
import { Fixture, createUser } from "@tests/factory";

describe("clients", () => {
  let factories: Fixture[] = [];

  beforeAll(async () => {
    await server.ready();
  });

  afterEach(async () => {
    for (const factory of factories) {
      await factory.destroy();
    }
    factories = [];
  });

  it("returns the list of clients", async () => {
    factories.push(await createUser());
    factories.push(await createUser());

    const response = await server.inject({
      method: "GET",
      headers: { ...getAuthHeader() },
      url: "/api/clients",
    });
    const jsonResp = JSON.parse(response.payload);

    expect(response.statusCode).toEqual(200);
    expect(jsonResp.length).toEqual(2);
  });
});
