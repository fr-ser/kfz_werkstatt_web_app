import server from "@backend/server";
import { _pool } from "@backend/db/db";

import { getAuthHeader } from "@tests/helpers";

jest.mock("@backend/db/db", () => {
  return {
    _pool: { query: jest.fn() },
  };
});

describe("health", () => {
  beforeAll(async () => {
    await server.ready();
  });

  it("returns 500 for if the database is unavailable", async () => {
    (_pool as any).query.mockImplementation(() => {
      throw "Error";
    });

    const response = await server.inject({
      method: "GET",
      headers: { ...getAuthHeader() },
      url: "/api/health",
    });
    expect(response.statusCode).toEqual(500);
  });

  it("returns 200 normally", async () => {
    (_pool as any).query.mockImplementation(() => 1);

    const response = await server.inject({
      method: "GET",
      headers: { ...getAuthHeader() },
      url: "/api/health",
    });
    expect(response.statusCode).toEqual(200);
  });
});
