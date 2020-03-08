import { PoolClient, Pool } from "pg";

import { NotFoundError } from "@backend/common";
import { _pool, executeWithTransaction } from "@backend/db/db";
import { GetCar, SaveCar, EditCar } from "@backend/interfaces/api";

const apiCarQuery = `
  WITH dict_base AS (
    SELECT
      o.car_id
      , json_build_object(
        'client_id', o.client_id,
        'name', client.first_name || ' ' || client.last_name
      ) AS dict
    FROM car_ownership AS o JOIN client using(client_id)
  )
  , car_owners AS (
    SELECT car_id, json_agg(dict) owners FROM dict_base GROUP BY car_id
  )
  SELECT car.*, COALESCE(car_owners.owners, '[]'::json) as owners
  FROM car
  LEFT JOIN car_owners using(car_id)
`;

export async function getCar(carId: string): Promise<GetCar> {
  let maybe_car = await _pool.query(apiCarQuery + "WHERE car_id = $1", [carId]);
  if (maybe_car.rowCount === 1) {
    return maybe_car.rows[0];
  } else {
    throw new NotFoundError(`Could not find car with id ${carId}`);
  }
}

export async function getCars(): Promise<GetCar[]> {
  return (await _pool.query(apiCarQuery)).rows;
}

export async function carExists(pgClient: PoolClient | Pool, carId: string): Promise<boolean> {
  const result = await pgClient.query(
    "SELECT EXISTS(SELECT 1 FROM car WHERE car_id = $1) as exists_",
    [carId]
  );

  return result.rows[0].exists_;
}

export async function deleteCar(carId: string) {
  if (!(await carExists(_pool, carId))) {
    throw new NotFoundError(`Could not find car with id ${carId}`);
  } else {
    await _pool.query("DELETE FROM car WHERE car_id = $1", [carId]);
  }
}

async function _maybeAssignOwnersToCar(pgClient: PoolClient, carId: string, ownerIds?: string[]) {
  if (ownerIds && ownerIds.length) {
    const query_args = ownerIds.reduce(
      (acc, ownerId, idx) => {
        // arguments are a bit tricky because the carId needs to
        // go to each ownerId (thats why we double the index)
        acc.args.push(carId, ownerId);
        acc.ordinals.push(`($${idx * 2 + 1}, $${idx * 2 + 2})`);
        return acc;
      },
      { ordinals: [] as string[], args: [] as string[] }
    );

    await pgClient.query(
      `INSERT INTO car_ownership (car_id, client_id) VALUES ${query_args.ordinals.join(", ")}`,
      query_args.args
    );
  }
}

async function _saveCar(pgClient: PoolClient, car: SaveCar) {
  await pgClient.query(
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

  await _maybeAssignOwnersToCar(pgClient, car.car_id, car.owner_ids);
}

export async function saveCar(car: SaveCar) {
  await executeWithTransaction(_saveCar, [car]);
}

async function _editCar(pgClient: PoolClient, carId: string, newProperties: EditCar) {
  const queryArgs = Object.entries(newProperties).reduce(
    (acc, [property, value]) => {
      if (property === "owner_ids") return acc;

      acc.arguments.push(value);
      acc.query.push(`${property} = $${acc.arguments.length}`);
      return acc;
    },
    { query: [] as string[], arguments: [carId] as any[] }
  );

  if (queryArgs.query.length) {
    await pgClient.query(
      `UPDATE car SET ${queryArgs.query.join(", ")} WHERE car_id = $1`,
      queryArgs.arguments
    );
  }

  if (newProperties.owner_ids) {
    await pgClient.query(`DELETE FROM car_ownership WHERE car_id = $1`, [carId]);
    await _maybeAssignOwnersToCar(pgClient, carId, newProperties.owner_ids);
  }
}

export async function editCar(carId: string, newProperties: EditCar) {
  if (!(await carExists(_pool, carId))) {
    throw new NotFoundError(`Could not find car with id ${carId}`);
  }
  await executeWithTransaction(_editCar, [carId, newProperties]);
}
