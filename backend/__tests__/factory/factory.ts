import { Pool } from "pg";

import { DB_URI } from "@backend/config";

export const test_pool = new Pool({
  connectionString: DB_URI,
  application_name: "jest-test",
});

interface CleanupOptions {
  articles?: string[];
  cars?: string[];
  clients?: string[];
  orders?: string[];
}
export async function smartCleanup({
  articles = [],
  cars = [],
  clients = [],
  orders = [],
}: CleanupOptions = {}) {
  if (articles.length > 0) {
    const sqlArticles = articles.map((article) => `'${article}'`).join(",");
    await test_pool.query(`DELETE FROM article WHERE article_number in (${sqlArticles})`);
  }

  if (orders.length > 0) {
    const sqlOrders = orders.map((order) => `'${order}'`).join(",");
    await test_pool.query(`DELETE FROM order_item_header WHERE order_id in (${sqlOrders})`);
    await test_pool.query(`DELETE FROM order_item_article WHERE order_id in (${sqlOrders})`);
    await test_pool.query(`DELETE FROM order_ WHERE order_id in (${sqlOrders})`);
  }

  if (cars.length > 0) {
    const sqlCars = cars.map((car) => `'${car}'`).join(",");
    await test_pool.query(`DELETE FROM car_ownership WHERE car_id in (${sqlCars})`);
    await test_pool.query(`DELETE FROM car WHERE car_id in (${sqlCars})`);
  }

  if (clients.length > 0) {
    const sqlClients = clients.map((client) => `'${client}'`).join(",");
    await test_pool.query(`DELETE FROM car_ownership WHERE client_id in (${sqlClients})`);
    await test_pool.query(`DELETE FROM client WHERE client_id in (${sqlClients})`);
  }
}
