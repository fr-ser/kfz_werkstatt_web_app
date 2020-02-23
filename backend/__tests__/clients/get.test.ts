import server from "@backend/server";

import { DbClient } from "@backend/interfaces/db";

import { Fixture } from "@tests/factory/factory";
import { createClient } from "@tests/factory/client";
import { getAuthHeader } from "@tests/helpers";

describe("get clients", () => {
  let factories: Fixture<DbClient>[] = [];

  beforeAll(async () => {
    await server.ready();
  });

  afterEach(async () => {
    for (const factory of factories) {
      await factory.destroy();
    }
    factories = [];
  });

  describe("client list", () => {
    it("returns the list of clients", async () => {
      factories.push(await createClient());
      factories.push(await createClient());

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
      const client = await createClient();
      factories.push(client);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/clients",
      });
      expect(response.payload).toEqual(JSON.stringify([client.element]));
    });
  });

  describe("single client", () => {
    it("returns the the client", async () => {
      const client = await createClient();
      factories.push(client);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/clients/${client.element.client_id}`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.payload).toEqual(JSON.stringify(client.element));
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
