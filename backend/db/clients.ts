import { PoolClient, Pool } from "pg";

import { _pool, executeWithTransaction } from "@backend/db/db";
import { GetClient, SaveClient, EditClient } from "@backend/interfaces/api";
import { NotFoundError } from "@backend/common";

const apiClientQuery = `
  WITH dict_base AS (
    SELECT o.client_id,
          json_build_object('car_id', o.car_id, 'license_plate', car.license_plate) AS dict
    FROM car_ownership AS o JOIN car using(car_id)
  )
  , owned_cars AS (
    SELECT client_id, json_agg(dict) cars FROM dict_base GROUP BY client_id
  )
  SELECT client.*, COALESCE(owned_cars.cars, '[]'::json) as cars
  FROM client
  LEFT JOIN owned_cars using(client_id)
`;

export async function getClient(clientId: string): Promise<GetClient> {
  let maybe_client = await _pool.query(apiClientQuery + "WHERE client_id = $1", [clientId]);
  if (maybe_client.rowCount === 1) {
    return maybe_client.rows[0];
  } else {
    throw new NotFoundError(`Could not find client with id ${clientId}`);
  }
}

export async function getClients(): Promise<GetClient[]> {
  return (await _pool.query(apiClientQuery)).rows;
}

export async function clientExists(
  pgClient: PoolClient | Pool,
  clientId: string
): Promise<boolean> {
  const result = await pgClient.query(
    "SELECT EXISTS(SELECT 1 FROM client WHERE client_id = $1) as exists_",
    [clientId]
  );

  return result.rows[0].exists_;
}

export async function deleteClient(clientId: string) {
  if (!(await clientExists(_pool, clientId))) {
    throw new NotFoundError(`Could not find client with id ${clientId}`);
  } else {
    await _pool.query("DELETE FROM client WHERE client_id = $1", [clientId]);
  }
}

async function _maybeAssignCarsToClient(
  pgClient: PoolClient,
  client_id: string,
  carIds?: string[]
) {
  if (carIds && carIds.length) {
    const query_args = carIds.reduce(
      (acc, carId, idx) => {
        // arguments are a bit tricky because the client id needs to
        // go to each carId (thats why we double the index)
        acc.args.push(carId, client_id);
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

async function _editClient(pgClient: PoolClient, clientId: string, newProperties: EditClient) {
  const queryArgs = Object.entries(newProperties).reduce(
    (acc, [property, value], idx) => {
      if (property === "car_ids") return acc;

      acc.arguments.push(value);
      acc.query.push(`${property} = $${acc.arguments.length}`);
      return acc;
    },
    { query: [] as string[], arguments: [clientId] as any[] }
  );

  if (queryArgs.query.length) {
    await pgClient.query(
      `UPDATE client SET ${queryArgs.query.join(", ")} WHERE client_id = $1`,
      queryArgs.arguments
    );
  }

  if (newProperties.car_ids) {
    await pgClient.query(`DELETE FROM car_ownership WHERE client_id = $1`, [clientId]);
    await _maybeAssignCarsToClient(pgClient, clientId, newProperties.car_ids);
  }
}

export async function editClient(clientId: string, newProperties: EditClient) {
  if (!(await clientExists(_pool, clientId))) {
    throw new NotFoundError(`Could not find client with id ${clientId}`);
  } else {
    await executeWithTransaction(_editClient, [clientId, newProperties]);
  }
}

async function _saveClient(pgClient: PoolClient, client: SaveClient) {
  await pgClient.query(
    `
      INSERT INTO client (
          client_id, first_name, last_name, email, phone_number, company_name,
          birthday, comment, mobile_number, zip_code, city, street_and_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `,
    [
      client.client_id,
      client.first_name,
      client.last_name,
      client.email,
      client.phone_number,
      client.company_name,
      client.birthday,
      client.comment,
      client.mobile_number,
      client.zip_code,
      client.city,
      client.street_and_number,
    ]
  );

  await _maybeAssignCarsToClient(pgClient, client.client_id, client.car_ids);
}

export async function saveClient(client: SaveClient) {
  await executeWithTransaction(_saveClient, [client]);
}
