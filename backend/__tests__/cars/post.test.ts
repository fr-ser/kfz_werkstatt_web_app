import { omit } from "lodash";

import server from "@backend/server";

import { getDbCar, getOwnersOfCar, getCarCount } from "@tests/cars/helpers";
import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createCar } from "@tests/factory/car";
import { createClient } from "../factory/client";

describe("cars - POST", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("creates a car for a valid payload", async () => {
    const payload = {
      car_id: "A123",
      license_plate: "license_plate",
      manufacturer: "manufacturer",
      model: "model",
      first_registration: "2012-12-12",
      color: "color",
      displacement: "displacement",
      comment: "comment",
      fuel: "fuel",
      performance: "performance",
      oil_change_date: "2012-12-12",
      oil_change_mileage: 12.34,
      tires: "195/65 R15 91H",
      tuev_date: "2012-12-12",
      vin: "vin",
      to_2: "to_2",
      to_3: "to_3",
      timing_belt_date: "2012-12-12",
      timing_belt_mileage: 12.34,
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/cars`,
      payload,
    });

    expect(response.statusCode).toEqual(201);
    expect(await getCarCount()).toBe(1);

    const dbCar = await getDbCar(payload.car_id);
    for (const key of Object.keys(payload)) {
      expect((dbCar as any)[key]).toEqual((payload as any)[key]);
    }
  });

  it("creates a car for a minimal payload", async () => {
    const payload = {
      car_id: "A123",
      license_plate: "license_plate",
      manufacturer: "manufacturer",
      model: "model",
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/cars`,
      payload,
    });

    expect(response.statusCode).toEqual(201);
    expect(await getCarCount()).toBe(1);

    const dbCar = await getDbCar(payload.car_id);
    for (const key of Object.keys(payload)) {
      expect((dbCar as any)[key]).toEqual((payload as any)[key]);
    }
  });

  it("creates a car with an owner", async () => {
    const client = await createClient();
    const payload = {
      car_id: "A123",
      license_plate: "license_plate",
      manufacturer: "manufacturer",
      model: "model",
      owner_ids: [client.client_id],
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/cars`,
      payload,
    });

    expect(response.statusCode).toEqual(201);
    expect(await getCarCount()).toBe(1);

    const dbCar = await getDbCar(payload.car_id);
    for (const key of Object.keys(omit(payload, "owner_ids"))) {
      expect((dbCar as any)[key]).toEqual((payload as any)[key]);
    }
    expect(await getOwnersOfCar(payload.car_id)).toEqual(new Set([client.client_id]));
  });

  it("returns 422 for database errors (duplicate key)", async () => {
    const existingCar = await createCar();
    const payload = {
      car_id: existingCar.car_id,
      license_plate: "license_plate",
      manufacturer: "manufacturer",
      model: "model",
    };
    const response = await server.inject({
      method: "POST",
      headers: { ...getAuthHeader() },
      url: `/api/cars`,
      payload,
    });

    expect(response.statusCode).toEqual(422);
    expect(await getCarCount()).toBe(1);
  });

  describe("invalid payload", () => {
    const validPayload = {
      car_id: "A123",
      license_plate: "a",
      manufacturer: "a",
      model: "a",
    };
    const invalidPayloads = [
      {},
      { some: "weird stuff" },
      { ...validPayload, some: "valid and invalid stuff" },
      { ...validPayload, car_id: "Ainvalid_id" },
      { ...validPayload, oil_change_mileage: -1 },
      { ...validPayload, tuev_date: "yesterday" },
      { ...validPayload, tires: "must be super special" },
      { ...validPayload, owner_ids: [] },
    ];
    for (const payload of invalidPayloads) {
      it(`returns 400 for ${JSON.stringify(payload)}`, async () => {
        const response = await server.inject({
          method: "POST",
          headers: { ...getAuthHeader() },
          url: `/api/cars`,
          payload,
        });

        expect(response.statusCode).toEqual(400);
        expect(await getCarCount()).toBe(0);
      });
    }

    const requiredProperties = ["car_id", "license_plate", "manufacturer", "model"];
    for (const property of requiredProperties) {
      it(`returns 400 for missing ${property}`, async () => {
        const payload: any = { ...validPayload };
        delete payload[property];

        const response = await server.inject({
          method: "POST",
          headers: { ...getAuthHeader() },
          url: `/api/cars`,
          payload,
        });

        expect(response.statusCode).toEqual(400);
        expect(await getCarCount()).toBe(0);
      });
    }
  });
});
