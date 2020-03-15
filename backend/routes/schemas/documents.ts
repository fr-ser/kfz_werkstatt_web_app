export const saveSchema = {
  type: "object",
  required: ["document_id", "type", "order_id", "client_id", "car_id"],
  additionalProperties: false,
  properties: {
    document_id: { type: "string" },
    type: { type: "string", enum: ["quote", "invoice"] },
    order_id: { type: "string" },
    client_id: { type: "string" },
    car_id: { type: "string" },
  },
};
