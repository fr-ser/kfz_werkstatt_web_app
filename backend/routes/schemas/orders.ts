const itemArticleSchema = {
  type: "object",
  required: ["position", "article_id", "description", "amount", "price_per_item", "discount"],
  additionalProperties: false,
  properties: {
    position: { type: "integer", minimum: 0 },
    article_id: { type: "string" },
    description: { type: "string" },
    amount: { type: "number", minimum: 0 },
    price_per_item: { type: "number" },
    discount: { type: "number", minimum: 0, maximum: 1 },
  },
};

const itemHeaderSchema = {
  type: "object",
  required: ["position", "header"],
  additionalProperties: false,
  properties: {
    position: { type: "integer", minimum: 0 },
    header: { type: "string" },
  },
};

const baseSchema = {
  car_id: { type: "string", pattern: "^A\\d+$" },
  client_id: { type: "string", pattern: "^K\\d+$" },
  title: { type: "string" },
  date: { type: "string", format: "date" },
  payment_due_date: { type: "string", format: "date" },
  payment_method: { type: "string", enum: ["cash", "remittance"] },
  state: { type: "string", enum: ["in_progress", "done", "cancelled"] },
  items: {
    type: "array",
    items: {
      anyOf: [itemArticleSchema, itemHeaderSchema],
    },
  },

  description: { type: "string" },
  mileage: { type: "number", minimum: 0 },
};

export const saveSchema = {
  type: "object",
  required: [
    "order_id",
    "car_id",
    "client_id",
    "title",
    "date",
    "payment_due_date",
    "payment_method",
    "state",
    "items",
  ],
  additionalProperties: false,
  properties: {
    ...baseSchema,
    order_id: { type: "string", pattern: "^Auf\\d+$" },
  },
};

export const editSchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    ...baseSchema,
  },
};
