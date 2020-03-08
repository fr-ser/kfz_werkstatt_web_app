import server from "@backend/server";

import { getOwnersOfCar, getDbCar } from "@tests/cars/helpers";
import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createCar } from "@tests/factory/car";
import { createClient } from "@tests/factory/client";

describe("cars - PUT", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("edits a car", async () => {
    const newOwner = await createClient();
    const car = await createCar([(await createClient()).client_id]);

    const response = await server.inject({
      method: "PUT",
      headers: { ...getAuthHeader() },
      url: `/api/cars/${(await car).car_id}`,
      payload: {
        license_plate: "HH-12-12",
        timing_belt_mileage: 12345,
        oil_change_date: "1990-12-31",
        owner_ids: [newOwner.client_id],
      },
    });

    expect(response.statusCode).toEqual(200);
    const dbCar = await getDbCar(car.car_id);
    expect(dbCar.license_plate).toEqual("HH-12-12");
    expect(dbCar.timing_belt_mileage).toEqual(12345);
    expect(dbCar.oil_change_date).toEqual("1990-12-31");
    expect(await getOwnersOfCar(car.car_id)).toEqual(new Set([newOwner.client_id]));
  });

  const invalidPayloads = [
    {},
    { some: "weird_stuff" },
    { car_id: "K1" },
    { license_plate: "Julio", some: "valid and invalid" },
  ];
  for (const payload of invalidPayloads) {
    it(`returns 400 for ${JSON.stringify(payload)}`, async () => {
      const car = createCar();
      const response = await server.inject({
        method: "PUT",
        headers: { ...getAuthHeader() },
        url: `/api/cars/${(await car).car_id}`,
        payload,
      });

      expect(response.statusCode).toEqual(400);
    });
  }
});
