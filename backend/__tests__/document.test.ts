import server from "@backend/server";
import { _pool } from "@backend/db/db";

import { db_cleanup } from "@tests/factory/factory";
import { createDocument } from "@tests/factory/document";
import { getAuthHeader } from "@tests/helpers";

describe("documents", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });
  describe("api/documents", () => {
    it("returns the list of documents", async () => {
      await createDocument();
      await createDocument();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/documents",
      });
      const jsonResp = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(jsonResp.length).toEqual(2);
    });

    it("returns correct document properties", async () => {
      const document = await createDocument();
      document;

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/documents",
      });
      expect(response.payload).toEqual(JSON.stringify([document]));
    });
  });

  describe("api/documents/<document_id>", () => {
    it("returns the the document", async () => {
      const document = await createDocument();

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/documents/${document.document_id}`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.payload).toEqual(JSON.stringify(document));
    });

    it("returns the 404 for non existing documents", async () => {
      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/documents/sth_not_existing`,
      });

      expect(response.statusCode).toEqual(404);
    });
  });
});
