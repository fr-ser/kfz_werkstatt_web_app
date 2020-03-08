import { omit } from "lodash";

import server from "@backend/server";

import { getDbClient, getCarsOfClient, getClientCount } from "@tests/clients/helpers";
import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createClient } from "@tests/factory/client";
import { createCar } from "@tests/factory/car";

describe("clients - POST", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("creates a client for a valid payload", async () => {
    const payload = {
      client_id: "K123",
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
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/clients`,
      payload,
    });

    expect(response.statusCode).toEqual(201);
    expect(await getClientCount()).toBe(1);

    const dbClient = await getDbClient(payload.client_id);
    for (const key of Object.keys(payload)) {
      expect((dbClient as any)[key]).toEqual((payload as any)[key]);
    }
  });

  it("creates a client for a minimal payload", async () => {
    const payload = {
      client_id: "K123",
      first_name: "first",
      last_name: "last",
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/clients`,
      payload,
    });

    expect(response.statusCode).toEqual(201);
    expect(await getClientCount()).toBe(1);

    const dbClient = await getDbClient(payload.client_id);
    for (const key of Object.keys(payload)) {
      expect((dbClient as any)[key]).toEqual((payload as any)[key]);
    }
  });

  it("creates a client with a car", async () => {
    const car = await createCar();
    const payload = {
      client_id: "K123",
      first_name: "first",
      last_name: "last",
      car_ids: [car.car_id],
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/clients`,
      payload,
    });

    expect(response.statusCode).toEqual(201);
    expect(await getClientCount()).toBe(1);

    const dbClient = await getDbClient(payload.client_id);
    for (const key of Object.keys(omit(payload, "car_ids"))) {
      expect((dbClient as any)[key]).toEqual((payload as any)[key]);
    }
    expect(await getCarsOfClient(payload.client_id)).toEqual(new Set([car.car_id]));
  });

  it("returns 422 for database errors (duplicate key)", async () => {
    const existingClient = await createClient();
    const payload = {
      client_id: existingClient.client_id,
      first_name: "first",
      last_name: "last",
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/clients`,
      payload,
    });

    expect(response.statusCode).toEqual(422);
    expect(await getClientCount()).toBe(1);
  });

  describe("invalid payload", () => {
    const validPayload = {
      client_id: "K123",
      first_name: "first",
      last_name: "last",
    };
    const invalidPayloads = [
      {},
      { some: "weird stuff" },
      { ...validPayload, client_id: "Kinvalid_id" },
      { ...validPayload, some: "valid and invalid stuff" },
      { ...validPayload, zip_code: 123456789 },
      { ...validPayload, car_ids: [] },
    ];
    for (const payload of invalidPayloads) {
      it(`returns 400 for ${JSON.stringify(payload)}`, async () => {
        const response = await server.inject({
          method: "POST",
          headers: { ...getAuthHeader() },
          url: `/api/clients`,
          payload,
        });

        expect(response.statusCode).toEqual(400);
        expect(await getClientCount()).toBe(0);
      });
    }

    const requiredProperties = ["client_id", "first_name", "last_name"];
    for (const property of requiredProperties) {
      it(`returns 400 for missing ${property}`, async () => {
        const payload: any = { ...validPayload };
        delete payload[property];

        const response = await server.inject({
          method: "POST",
          headers: { ...getAuthHeader() },
          url: `/api/clients`,
          payload,
        });

        expect(response.statusCode).toEqual(400);
        expect(await getClientCount()).toBe(0);
      });
    }
  });
});
