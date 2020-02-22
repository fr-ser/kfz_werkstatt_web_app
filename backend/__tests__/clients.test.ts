import server from "../server";

import { getAuthHeader } from "./helpers";
import { _pool } from "../db/db";
import { Factory, createUser } from "./factory";

describe("clients", () => {
  let factories: Factory[] = [];

  beforeAll(async () => {
    await server.ready();
  });

  afterEach(async () => {
    for (const factory of factories) {
      await factory.destroy();
    }
  });

  it("returns the list of clients", async () => {
    factories.push(await createUser());

    const response = await server.inject({
      method: "GET",
      headers: { ...getAuthHeader() },
      url: "/api/clients",
    });
    const jsonResp = JSON.parse(response.payload);

    expect(response.statusCode).toEqual(200);
    expect(jsonResp.length).toEqual(1);
  });
});
