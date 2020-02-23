import { _pool } from "@backend/db/db";
import { DbCar } from "@backend/interfaces/db";

export async function getCars(): Promise<DbCar[]>;
export async function getCars(carId: string): Promise<DbCar | null>;
export async function getCars(carId?: string): Promise<DbCar[] | DbCar | null> {
  if (!carId) {
    return (await _pool.query("SELECT * FROM car ORDER BY car_id desc")).rows;
  } else {
    let maybe_car = await _pool.query("SELECT * FROM car WHERE car_id = $1", [carId]);
    if (maybe_car.rowCount === 1) {
      return maybe_car.rows[0];
    } else {
      return null;
    }
  }
}
