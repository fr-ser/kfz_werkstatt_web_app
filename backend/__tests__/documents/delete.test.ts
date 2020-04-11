import server from "@backend/server";

import { getAuthHeader } from "@tests/helpers";
import { createDocument } from "@tests/factory/document";
import { documentExists } from "@tests/documents/helpers";

describe("documents - DELETE", () => {
  beforeAll(async () => {
    await server.ready();
  });

  it("deletes a document", async () => {
    const document = await createDocument();

    const response = await server.inject({
      method: "DELETE",
      headers: { ...getAuthHeader() },
      url: `/api/documents/${document.document_id}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(await documentExists(document.document_id)).toBe(false);
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
