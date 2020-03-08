import * as faker from "faker";

import { DbCar } from "@backend/interfaces/db";

import { test_pool } from "@tests/factory/factory";
import { getRandomDate } from "@tests/helpers";

export async function createCar(ownerIds?: string[]): Promise<DbCar> {
  const car = {
    car_id: `A${Date.now()}`,
    license_plate: faker.random.alphaNumeric(10),
    manufacturer: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    first_registration: getRandomDate(),
    color: faker.commerce.color(),
    displacement: faker.random.alphaNumeric(5),
    comment: faker.lorem.words(7),
    fuel: faker.vehicle.fuel(),
    performance: faker.random.alphaNumeric(5),
    oil_change_date: getRandomDate(),
    oil_change_mileage: faker.random.number(),
    tires: faker.random.alphaNumeric(5),
    tuev_date: getRandomDate(),
    vin: faker.vehicle.vin(),
    to_2: faker.random.alphaNumeric(5),
    to_3: faker.random.alphaNumeric(5),
    timing_belt_date: getRandomDate(),
    timing_belt_mileage: faker.random.number(),
  };

  await test_pool.query(
    `
      INSERT INTO car (
        car_id, license_plate, manufacturer, model, first_registration, color,
        displacement, comment, fuel, performance, oil_change_date, oil_change_mileage, tires,
        tuev_date, vin, to_2, to_3, timing_belt_date, timing_belt_mileage
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      )
    `,
    [
      car.car_id,
      car.license_plate,
      car.manufacturer,
      car.model,
      car.first_registration,
      car.color,
      car.displacement,
      car.comment,
      car.fuel,
      car.performance,
      car.oil_change_date,
      car.oil_change_mileage,
      car.tires,
      car.tuev_date,
      car.vin,
      car.to_2,
      car.to_3,
      car.timing_belt_date,
      car.timing_belt_mileage,
    ]
  );

  if (ownerIds && ownerIds.length) {
    const query_args = ownerIds.reduce(
      (acc, ownerId, idx) => {
        // arguments are a bit tricky because the client id needs to
        // go to each ownerId (thats why we double the idx)
        acc.args.push(car.car_id, ownerId);
        acc.ordinals.push(`($${idx * 2 + 1}, $${idx * 2 + 2})`);
        return acc;
      },
      { ordinals: [] as string[], args: [] as string[] }
    );

    await test_pool.query(
      `INSERT INTO car_ownership (car_id, client_id) VALUES ${query_args.ordinals.join(", ")}`,
      query_args.args
    );
  }

  return car;
}
