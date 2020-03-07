import { pick, omit } from "lodash";

import server from "@backend/server";

import { getClients } from "@backend/db/clients";

import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createClient } from "@tests/factory/client";

describe("clients", () => {
  const requiredProperties = ["client_id", "first_name", "last_name"];
  const validPayload = {
    client_id: "some_id",
    first_name: "first",
    last_name: "last",
    email: "me@mail.com",
    phone_number: "099 234 -23",
    company_name: "company GmbH",
    birthday: "1990-12-12",
    comment: "some comment",
    mobile_number: "+49 30 123",
    zip_code: 12345,
    city: "city",
    street_and_number: "street 44",
  };

  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  describe("post client", () => {
    it("creates a client for a valid payload", async () => {
      const response = await server.inject({
        method: "POST",
        headers: { ...getAuthHeader() },
        url: `/api/clients`,
        payload: validPayload,
      });

      expect(response.statusCode).toEqual(201);
      const dbClients = await getClients();
      expect(dbClients.length).toBe(1);
      expect(dbClients[0]).toEqual(validPayload);
    });

    it("creates a client for a minimal payload", async () => {
      const response = await server.inject({
        method: "POST",
        headers: { ...getAuthHeader() },
        url: `/api/clients`,
        payload: pick(validPayload, requiredProperties),
      });

      expect(response.statusCode).toEqual(201);
      const dbClients = await getClients();
      expect(dbClients.length).toBe(1);
    });

    it("returns the 422 for database errors (duplicate key)", async () => {
      const existingClient = await createClient();
      const response = await server.inject({
        method: "POST",
        headers: { ...getAuthHeader() },
        url: `/api/clients`,
        payload: pick(existingClient, ["client_id", "first_name", "last_name"]),
      });

      expect(response.statusCode).toEqual(422);
    });

    it("returns the 400 for nonsense", async () => {
      const response = await server.inject({
        method: "POST",
        headers: { ...getAuthHeader() },
        url: `/api/clients`,
        payload: { some: "weird stuff" },
      });

      expect(response.statusCode).toEqual(400);
    });

    for (const property of requiredProperties) {
      it(`returns the 400 for missing ${property}`, async () => {
        const invalidCopy: any = { ...validPayload };
        delete invalidCopy[property];

        const response = await server.inject({
          method: "POST",
          headers: { ...getAuthHeader() },
          url: `/api/clients`,
          payload: invalidCopy,
        });

        expect(response.statusCode).toEqual(400);
      });
    }
  });
});
