const baseSchema = {
  description: { type: "string" },
  article_number: { type: "string" },
  stock_amount: { type: "number", minimum: 0 },
  price: { type: "number", minimum: 0 },
};

export const saveSchema = {
  type: "object",
  required: ["article_id", "description"],
  additionalProperties: false,
  properties: {
    ...baseSchema,
    article_id: { type: "string", pattern: "^Art\\d+$" },
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
