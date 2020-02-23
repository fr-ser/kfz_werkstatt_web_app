import server from "@backend/server";

describe("authentication", () => {
  beforeAll(async () => {
    await server.ready();
  });

  it("returns 401 for unauthenticated requests", async () => {
    const response = await server.inject({ method: "GET", url: "/" });
    expect(response.statusCode).toEqual(401);
  });

  it("returns 401 for wrong credentials", async () => {
    const encoded_credentials = Buffer.from("not_a_user:not_a_pass").toString("base64");
    const response = await server.inject({
      method: "GET",
      headers: { Authorization: `Basic ${encoded_credentials}` },
      url: "/",
    });
    expect(response.statusCode).toEqual(401);
  });

  it("returns 200 for authenticated requests", async () => {
    const credentials = ["test_user_1:test_pass_1", "test_user_2:test_pass_2"];

    for (const credential of credentials) {
      const encoded_credentials = Buffer.from(credential).toString("base64");
      const response = await server.inject({
        method: "GET",
        headers: { Authorization: `Basic ${encoded_credentials}` },
        url: "/",
      });
      expect(response.statusCode).toEqual(200);
    }
  });
});
