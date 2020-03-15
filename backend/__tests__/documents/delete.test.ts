import server from "@backend/server";

import { getDocuments } from "@backend/db/documents";

import { getAuthHeader } from "@tests/helpers";
import { db_cleanup } from "@tests/factory/factory";
import { createDocument } from "@tests/factory/document";

describe("documents - DELETE", () => {
  beforeAll(async () => {
    await server.ready();
  });

  beforeEach(async () => {
    await db_cleanup();
  });

  it("deletes a document", async () => {
    const document = await createDocument();

    expect(await getDocuments()).toHaveLength(1);
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/documents/${document.document_id}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(await getDocuments()).toHaveLength(0);
  });

  it("returns 404 for missing documents", async () => {
    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/documents/sth_not_right`,
    });

    expect(response.statusCode).toEqual(404);
    expect(JSON.parse(response.payload).msg).toBeTruthy();
  });
});
