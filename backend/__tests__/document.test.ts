import server from "@backend/server";
import { _pool } from "@backend/db/db";

import { DbDocument } from "@backend/interfaces/db";

import { Fixture } from "@tests/factory/factory";
import { createDocument } from "@tests/factory/document";
import { getAuthHeader } from "@tests/helpers";

describe("documents", () => {
  let factories: Fixture<DbDocument>[] = [];

  beforeAll(async () => {
    await server.ready();
  });

  afterEach(async () => {
    for (const factory of factories) {
      await factory.destroy();
    }
    factories = [];
  });

  describe("api/documents", () => {
    it("returns the list of documents", async () => {
      factories.push(await createDocument());
      factories.push(await createDocument());

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
      factories.push(document);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: "/api/documents",
      });
      expect(response.payload).toEqual(JSON.stringify([document.element]));
    });
  });

  describe("api/documents/<document_id>", () => {
    it("returns the the document", async () => {
      const document = await createDocument();
      factories.push(document);

      const response = await server.inject({
        method: "GET",
        headers: { ...getAuthHeader() },
        url: `/api/documents/${document.element.document_id}`,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.payload).toEqual(JSON.stringify(document.element));
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
