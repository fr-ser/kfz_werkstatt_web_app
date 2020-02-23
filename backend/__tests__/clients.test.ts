import server from "@backend/server";
import { _pool } from "@backend/db/db";

import { getAuthHeader } from "@tests/helpers";
import { Fixture, createClient } from "@tests/factory";
import { DbClient } from "@backend/interfaces/database";

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

  describe("api/clients", () => {
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
      assertClientEqualToPayload(client, JSON.parse(response.payload)[0]);
    });
  });

  describe("api/clients/<client_id>", () => {
    it("returns the the client", async () => {
      const client = await createClient();
      factories.push(client);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/clients/${client.client_id}`,
      });

      expect(response.statusCode).toEqual(200);
      assertClientEqualToPayload(client, JSON.parse(response.payload));
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

// helpers

function assertClientEqualToPayload(client: DbClient, payload: any) {
  expect(payload.client_id).toEqual(client.client_id);
  expect(payload.first_name).toEqual(client.first_name);
  expect(payload.last_name).toEqual(client.last_name);
  expect(payload.email).toEqual(client.email);
  expect(payload.phone_number).toEqual(client.phone_number);
  expect(payload.company_name).toEqual(client.company_name);
  expect(payload.comment).toEqual(client.comment);
  expect(payload.mobile_number).toEqual(client.mobile_number);
  expect(payload.zip_code).toEqual(client.zip_code);
  expect(payload.city).toEqual(client.city);
  expect(payload.street_and_number).toEqual(client.street_and_number);

  expect(payload.birthday).toBeTruthy();
  const parsedDate = Date.parse(payload.birthday);
  expect(parsedDate).not.toBeNaN();
}
