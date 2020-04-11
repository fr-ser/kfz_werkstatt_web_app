import server from "@backend/server";

import { getAuthHeader } from "@tests/helpers";
import { createDocument } from "@tests/factory/document";

describe("documents - PUT", () => {
  beforeAll(async () => {
    await server.ready();
  });

  it("does not have an edit endpoint", async () => {
    const document = await createDocument();

    const response = await server.inject({
      method: "PUT",
      headers: { ...getAuthHeader() },
      url: `/api/documents/${document.document_id}`,
    });

    expect(response.statusCode).toEqual(404);
  });
});
