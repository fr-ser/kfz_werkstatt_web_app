import { _pool } from "@backend/db/db";
import { DbClient } from "@backend/interfaces/db";
import { ApiClient } from "@backend/interfaces/api";
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

export async function getClient(clientId: string): Promise<ApiClient> {
  let maybe_client = await _pool.query(apiClientQuery + "WHERE client_id = $1", [clientId]);
  if (maybe_client.rowCount === 1) {
    return maybe_client.rows[0];
  } else {
    throw new NotFoundError(`Could not find client with id ${clientId}`);
  }
}

export async function getClients(): Promise<ApiClient[]> {
  return (await _pool.query(apiClientQuery)).rows;
}

export async function deleteClient(clientId: string) {
  const clientExists = (
    await _pool.query("SELECT EXISTS(SELECT 1 FROM client WHERE client_id = $1) as exists_", [
      clientId,
    ])
  ).rows[0].exists_;

  if (!clientExists) throw new NotFoundError(`Could not find client with id ${clientId}`);
  else {
    await _pool.query("DELETE FROM client WHERE client_id = $1", [clientId]);
  }
}

export async function saveClient(client: DbClient) {
  await _pool.query(
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
  return getClient(client.client_id);
}
