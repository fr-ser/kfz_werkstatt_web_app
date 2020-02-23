import { _pool } from "@backend/db/db";
import { DbDocument } from "@backend/interfaces/db";

export async function getDocuments(): Promise<DbDocument[]>;
export async function getDocuments(documentId: string): Promise<DbDocument | null>;
export async function getDocuments(documentId?: string): Promise<DbDocument[] | DbDocument | null> {
  if (!documentId) {
    return (await _pool.query("SELECT * FROM document")).rows;
  } else {
    let maybe_document = await _pool.query("SELECT * FROM document WHERE document_id = $1", [
      documentId,
    ]);
    if (maybe_document.rowCount === 1) {
      return maybe_document.rows[0];
    } else {
      return null;
    }
  }
}
