import { NotFoundError } from "@backend/common";
import { getCar, getCars, deleteCar, saveCar, editCar } from "@backend/db/cars";

import { createCar } from "@tests/factory/car";
import { db_cleanup } from "@tests/factory/factory";
import { createClient } from "../factory/client";
import { getOwnersOfCar, getCarCount, carExists, getDbCar } from "@tests/cars/helpers";

describe("cars - database queries", () => {
  beforeEach(async () => {
    await db_cleanup();
  });

  describe("getCar", () => {
    it("returns the car with no owners", async () => {
      const dbCar = await createCar();

      const apiCar = await getCar(dbCar.car_id);

      for (const key of Object.keys(dbCar)) {
        expect((apiCar as any)[key]).toEqual((dbCar as any)[key]);
      }
      expect(apiCar.owners).toEqual([]);
    });

    it("returns the car with two owners", async () => {
      const owner1 = await createClient();
      const owner2 = await createClient();
      const dbCar = await createCar([owner1.client_id, owner2.client_id]);

      const apiCar = await getCar(dbCar.car_id);

      for (const key of Object.keys(dbCar)) {
        expect((apiCar as any)[key]).toEqual((dbCar as any)[key]);
      }

      const dbOwners = [
        { client_id: owner1.client_id, name: `${owner1.first_name} ${owner1.last_name}` },
        { client_id: owner2.client_id, name: `${owner2.first_name} ${owner2.last_name}` },
      ];
      // using set to ignore order
      expect(new Set(apiCar.owners)).toEqual(new Set(dbOwners));
    });

    it("throws the NotFoundError if no car exists", async () => {
      try {
        await getCar("not_existing");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("getCars", () => {
    it("returns an empty list for no cars", async () => {
      expect(await getCars()).toEqual([]);
    });

    it("returns all cars", async () => {
      const dbCar1 = await createCar();
      const dbCar2 = await createCar();

      const apiCars = await getCars();

      expect(apiCars).toHaveLength(2);

      const apiCar1 = apiCars.find(x => x.car_id === dbCar1.car_id);
      const apiCar2 = apiCars.find(x => x.car_id === dbCar2.car_id);

      for (const key of Object.keys(dbCar1)) {
        expect((apiCar1 as any)[key]).toEqual((dbCar1 as any)[key]);
      }
      expect(apiCar1!.owners).toEqual([]);

      for (const key of Object.keys(dbCar2)) {
        expect((apiCar2 as any)[key]).toEqual((dbCar2 as any)[key]);
      }
      expect(apiCar2!.owners).toEqual([]);
    });

    it("returns cars with owners", async () => {
      const dbClient = await createClient();
      const dbCar = await createCar([dbClient.client_id]);

      const apiCar = (await getCars())[0];

      for (const key of Object.keys(dbCar)) {
        expect((apiCar as any)[key]).toEqual((dbCar as any)[key]);
      }

      const dbCars = [
        { client_id: dbClient.client_id, name: `${dbClient.first_name} ${dbClient.last_name}` },
      ];
      expect(apiCar.owners).toEqual(dbCars);
    });
  });

  describe("deleteCar", () => {
    it("deletes a car", async () => {
      await createCar(); // one car, which should not be deleted
      const dbCar = await createCar();

      expect(await carExists(dbCar.car_id)).toBe(true);
      expect(await getCarCount()).toBe(2);

      await deleteCar(dbCar.car_id);

      expect(await carExists(dbCar.car_id)).toBe(false);
      expect(await getCarCount()).toBe(1);
    });

    it("throws the NotFoundError, if the car does not exist", async () => {
      try {
        await deleteCar("not_existing");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("saveCar", () => {
    it("saves a car with no cars", async () => {
      const carId = "sth";
      expect(await carExists(carId)).toBe(false);

      const payload = {
        car_id: carId,
        license_plate: "B-12-12",
        manufacturer: "BMW",
        model: "A1",
      };
      await saveCar(payload);

      const dbOrder = await getDbCar(carId);
      for (const [key, value] of Object.entries(payload)) {
        expect((dbOrder as any)[key]).toEqual(value);
      }
    });

    it("saves a car with two cars", async () => {
      const owner1 = await createClient();
      const owner2 = await createClient();
      const carId = "sth";
      expect(await carExists(carId)).toBe(false);

      await saveCar({
        car_id: carId,
        license_plate: "B-12-12",
        manufacturer: "BMW",
        model: "A1",
        owner_ids: [owner1.client_id, owner2.client_id],
      });

      expect(await carExists(carId)).toBe(true);
      expect(await getOwnersOfCar(carId)).toEqual(new Set([owner1.client_id, owner2.client_id]));
    });

    it("throws an error if the car cannot be saved", async () => {
      try {
        await saveCar({} as any);
      } catch (error) {
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("editCar", () => {
    const changeableStringProperties = [
      "license_plate",
      "manufacturer",
      "model",
      "color",
      "displacement",
      "comment",
      "fuel",
      "performance",
      "tires",
      "vin",
      "to_2",
      "to_3",
    ];
    for (const changeProperty of changeableStringProperties) {
      it(`changes the property: ${changeProperty}`, async () => {
        const car = await createCar();

        await editCar(car.car_id, { [changeProperty]: "newValue" });

        const dbCar = await getDbCar(car.car_id);
        expect((dbCar as any)[changeProperty]).toEqual("newValue");
      });
    }

    const changeableStringDateProperties = [
      "first_registration",
      "oil_change_date",
      "tuev_date",
      "timing_belt_date",
    ];
    for (const changeProperty of changeableStringDateProperties) {
      it(`changes the property: ${changeProperty}`, async () => {
        const car = await createCar();

        await editCar(car.car_id, { [changeProperty]: "1990-12-31" });

        const dbCar = await getDbCar(car.car_id);
        expect((dbCar as any)[changeProperty]).toEqual("1990-12-31");
      });
    }

    const changeableNumberProperties = ["oil_change_mileage", "timing_belt_mileage"];
    for (const changeProperty of changeableNumberProperties) {
      it(`changes the property: ${changeProperty}`, async () => {
        const car = await createCar();

        await editCar(car.car_id, { [changeProperty]: 12345 });

        const dbCar = await getDbCar(car.car_id);
        expect((dbCar as any)[changeProperty]).toEqual(12345);
      });
    }

    it("changes multiple properties at once", async () => {
      const owner = await createClient();
      const car = await createCar();

      await editCar(car.car_id, {
        license_plate: "HH-12-12",
        oil_change_mileage: 12345,
        first_registration: "1990-12-31",
        owner_ids: [owner.client_id],
      });

      const dbCar = await getDbCar(car.car_id);
      expect(dbCar.license_plate).toEqual("HH-12-12");
      expect(dbCar.oil_change_mileage).toEqual(12345);
      expect(dbCar.first_registration).toEqual("1990-12-31");
      expect(await getOwnersOfCar(car.car_id)).toEqual(new Set([owner.client_id]));
    });

    it("throws an error if the car cannot be edited", async () => {
      try {
        await editCar("asdf", { x: "y" } as any);
      } catch (error) {
        return;
      }
      fail("nothing thrown");
    });

    it("throws the NotFoundError if the car does not exist", async () => {
      try {
        await editCar("not_existing", {} as any);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });

    describe("change car owner", () => {
      it("adds a car owner", async () => {
        const client = await createClient();
        const car = await createCar();

        await editCar(car.car_id, {
          owner_ids: [client.client_id],
        });

        expect(await getOwnersOfCar(car.car_id)).toEqual(new Set([client.client_id]));
      });

      it("deletes a car owner", async () => {
        const car = await createCar([(await createClient()).client_id]);

        await editCar(car.car_id, {
          owner_ids: [],
        });

        expect(await getOwnersOfCar(car.car_id)).toEqual(new Set());
      });

      it("edits a car owner", async () => {
        const newOwner = await createClient();
        const car = await createCar([(await createClient()).client_id]);

        await editCar(car.car_id, {
          owner_ids: [newOwner.client_id],
        });

        expect(await getOwnersOfCar(car.car_id)).toEqual(new Set([newOwner.client_id]));
      });
    });
  });
});
