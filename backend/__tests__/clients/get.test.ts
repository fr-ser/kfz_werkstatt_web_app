import server from "@backend/server";

import { createClient } from "@tests/factory/client";
import { db_cleanup } from "@tests/factory/factory";
import { getAuthHeader } from "@tests/helpers";

describe("get clients", () => {
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
      const client = await createClient();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/clients",
      });
      expect(response.payload).toEqual(JSON.stringify([client]));
    });
  });

  describe("single client", () => {
    it("returns the the client", async () => {
      const client = await createClient();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/clients/${client.client_id}`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.payload).toEqual(JSON.stringify(client));
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
