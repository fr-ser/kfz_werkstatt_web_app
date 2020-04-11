import { NotFoundError } from "@backend/common";
import { GetClient } from "@backend/interfaces/api";
import { getClient, getClients, deleteClient, saveClient, editClient } from "@backend/db/clients";

import { createClient } from "@tests/factory/client";
import { createCar } from "@tests/factory/car";
import { smartCleanup } from "@tests/factory/factory";
import { getCarsOfClient, clientExists, getDbClient } from "@tests/clients/helpers";

describe("clients - database queries", () => {
  let cleanupCars: string[] = [];
  let cleanupClients: string[] = [];

  afterEach(async () => {
    await smartCleanup({ cars: cleanupCars, clients: cleanupClients });
    cleanupCars = [];
    cleanupClients = [];
  });

  describe("getClient", () => {
    it("returns the client with no cars", async () => {
      const dbClient = await createClient();
      cleanupClients.push(dbClient.client_id);

      const apiClient = await getClient(dbClient.client_id);

      for (const key of Object.keys(dbClient)) {
        expect((apiClient as any)[key]).toEqual((dbClient as any)[key]);
      }
      expect(apiClient.cars).toEqual([]);
    });

    it("returns the client with two cars", async () => {
      const car1 = await createCar();
      const car2 = await createCar();
      cleanupCars.push(car1.car_id, car2.car_id);
      const dbClient = await createClient([car1.car_id, car2.car_id]);
      cleanupClients.push(dbClient.client_id);

      const apiClient = await getClient(dbClient.client_id);

      for (const key of Object.keys(dbClient)) {
        expect((apiClient as any)[key]).toEqual((dbClient as any)[key]);
      }

      const dbCars = [
        { car_id: car1.car_id, license_plate: car1.license_plate },
        { car_id: car2.car_id, license_plate: car2.license_plate },
      ];
      expect(new Set(apiClient.cars)).toEqual(new Set(dbCars));
    });

    it("throws the NotFoundError if no client exists", async () => {
      try {
        await getClient("not_existing");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("getClients", () => {
    it("returns all clients", async () => {
      const dbClient1 = await createClient();
      const dbClient2 = await createClient();
      cleanupClients.push(dbClient1.client_id, dbClient2.client_id);

      const apiClients = await getClients();
      const apiClient1 = apiClients.find((x) => x.client_id === dbClient1.client_id);
      const apiClient2 = apiClients.find((x) => x.client_id === dbClient2.client_id);

      for (const key of Object.keys(dbClient1)) {
        expect((apiClient1 as any)[key]).toEqual((dbClient1 as any)[key]);
      }
      expect(apiClient1!.cars).toEqual([]);

      for (const key of Object.keys(dbClient2)) {
        expect((apiClient2 as any)[key]).toEqual((dbClient2 as any)[key]);
      }
      expect(apiClient2!.cars).toEqual([]);
    });

    it("returns clients with cars", async () => {
      const dbCar = await createCar();
      cleanupCars.push(dbCar.car_id);
      const dbClient = await createClient([dbCar.car_id]);
      cleanupClients.push(dbClient.client_id);

      const apiClient = (await getClients()).find(
        (apiClient) => apiClient.client_id === dbClient.client_id
      ) as GetClient;

      for (const key of Object.keys(dbClient)) {
        expect((apiClient as any)[key]).toEqual((dbClient as any)[key]);
      }

      const dbCars = [{ car_id: dbCar.car_id, license_plate: dbCar.license_plate }];
      expect(apiClient.cars).toEqual(dbCars);
    });
  });

  describe("deleteClient", () => {
    it("deletes a client", async () => {
      const dbClient = await createClient();

      await deleteClient(dbClient.client_id);

      expect(await clientExists(dbClient.client_id)).toBe(false);
    });

    it("throws the NotFoundError, if the client does not exist", async () => {
      try {
        await deleteClient("not_existing");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("saveClient", () => {
    it("saves a client with no cars", async () => {
      const clientId = "sth";
      cleanupClients.push(clientId);

      const payload = {
        client_id: clientId,
        first_name: "first_name",
        last_name: "last_name",
      };
      await saveClient(payload);

      const dbClient = await getDbClient(clientId);
      for (const [key, value] of Object.entries(payload)) {
        expect((dbClient as any)[key]).toEqual(value);
      }
    });

    it("throws an error if the client cannot be saved", async () => {
      try {
        await saveClient({} as any);
      } catch (error) {
        return;
      }
      fail("nothing thrown");
    });

    it("saves a client with two cars", async () => {
      const car1 = await createCar();
      const car2 = await createCar();
      cleanupCars.push(car1.car_id, car2.car_id);
      const clientId = "sth";
      cleanupClients.push(clientId);

      await saveClient({
        client_id: clientId,
        first_name: "first_name",
        last_name: "last_name",
        car_ids: [car1.car_id, car2.car_id],
      });

      expect(await clientExists(clientId)).toBe(true);
      expect(await getCarsOfClient(clientId)).toEqual(new Set([car1.car_id, car2.car_id]));
    });
  });

  describe("editClient", () => {
    const changeableStringProperties = [
      "first_name",
      "last_name",
      "email",
      "phone_number",
      "company_name",
      "comment",
      "mobile_number",
      "city",
      "street_and_number",
    ];
    for (const changeProperty of changeableStringProperties) {
      it(`changes the property: ${changeProperty}`, async () => {
        const client = await createClient();
        cleanupClients.push(client.client_id);

        await editClient(client.client_id, { [changeProperty]: "newValue" });

        const dbClient = await getDbClient(client.client_id);
        expect((dbClient as any)[changeProperty]).toEqual("newValue");
      });
    }

    it(`changes the property: zip_code`, async () => {
      const client = await createClient();
      cleanupClients.push(client.client_id);

      await editClient(client.client_id, { zip_code: 12345 });

      const dbClient = await getDbClient(client.client_id);
      expect(dbClient.zip_code).toEqual(12345);
    });

    it(`changes the property: birthday`, async () => {
      const client = await createClient();
      cleanupClients.push(client.client_id);

      await editClient(client.client_id, { birthday: "1990-12-31" });

      const dbClient = await getDbClient(client.client_id);
      expect(dbClient.birthday).toEqual("1990-12-31");
    });

    it("changes multiple properties at once", async () => {
      const car = await createCar();
      cleanupCars.push(car.car_id);
      const client = await createClient();
      cleanupClients.push(client.client_id);

      await editClient(client.client_id, {
        first_name: "Fernando",
        zip_code: 12345,
        birthday: "1990-12-31",
        car_ids: [car.car_id],
      });

      const dbClient = await getDbClient(client.client_id);
      expect(dbClient.first_name).toEqual("Fernando");
      expect(dbClient.zip_code).toEqual(12345);
      expect(dbClient.birthday).toEqual("1990-12-31");
      expect(await getCarsOfClient(client.client_id)).toEqual(new Set([car.car_id]));
    });

    it("throws an error if the client cannot be edited", async () => {
      try {
        await editClient("asdf", { x: "y" } as any);
      } catch (error) {
        return;
      }
      fail("nothing thrown");
    });

    it("throws the NotFoundError if the client does not exist", async () => {
      try {
        await editClient("not_existing", {} as any);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });

    describe("change car ownership", () => {
      it("adds a car ownership", async () => {
        const car = await createCar();
        cleanupCars.push(car.car_id);
        const client = await createClient();
        cleanupClients.push(client.client_id);

        await editClient(client.client_id, {
          car_ids: [car.car_id],
        });

        expect(await getCarsOfClient(client.client_id)).toEqual(new Set([car.car_id]));
      });

      it("deletes a car ownership", async () => {
        const car = await createCar();
        cleanupCars.push(car.car_id);
        const client = await createClient([car.car_id]);
        cleanupClients.push(client.client_id);

        await editClient(client.client_id, {
          car_ids: [],
        });

        expect(await getCarsOfClient(client.client_id)).toEqual(new Set());
      });

      it("edits a car ownership", async () => {
        const oldCar = await createCar();
        const newCar = await createCar();
        cleanupCars.push(oldCar.car_id, newCar.car_id);
        const client = await createClient([oldCar.car_id]);
        cleanupClients.push(client.client_id);

        await editClient(client.client_id, {
          car_ids: [newCar.car_id],
        });

        expect(await getCarsOfClient(client.client_id)).toEqual(new Set([newCar.car_id]));
      });
    });
  });
});
