import { test_pool } from "@tests/factory/factory";
import { DbCar } from "@backend/interfaces/db";

export async function getOwnersOfCar(carId: string): Promise<Set<string>> {
  const result = await test_pool.query("SELECT client_id from car_ownership WHERE car_id = $1", [
    carId,
  ]);
  return new Set(result.rows.map((row) => row.client_id));
}

export async function carExists(carId: string): Promise<boolean> {
  const result = await test_pool.query(
    `SELECT EXISTS(SELECT 1 FROM car WHERE car_id = $1) as exists_`,
    [carId]
  );
  return result.rows[0].exists_;
}

export async function getDbCar(carId: string): Promise<DbCar> {
  const result = await test_pool.query(`SELECT * FROM car WHERE car_id = $1`, [carId]);
  return result.rows[0];
}
