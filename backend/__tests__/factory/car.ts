import * as faker from "faker";

import { DbCar } from "@backend/interfaces/db";

import { Fixture, _test_pool } from "@tests/factory/factory";
import { getRandomDate } from "@tests/helpers";

function getCarCleanup(carId: string) {
  return async function() {
    await _test_pool.query(`DELETE FROM car WHERE car_id = $1`, [carId]);
  };
}

export async function createCar(): Promise<Fixture<DbCar>> {
  const car = {
    car_id: `A${Date.now()}`,
    license_plate_numer: faker.random.alphaNumeric(10),
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

  await _test_pool.query(
    `
        INSERT INTO car (
          car_id, license_plate_numer, manufacturer, model, first_registration, color,
          displacement, comment, fuel, performance, oil_change_date, oil_change_mileage, tires,
          tuev_date, vin, to_2, to_3, timing_belt_date, timing_belt_mileage
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
    `,
    [
      car.car_id,
      car.license_plate_numer,
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

  return { element: car, destroy: getCarCleanup(car.car_id) };
}
