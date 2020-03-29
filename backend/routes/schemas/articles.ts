const baseSchema = {
  description: { type: "string" },
  stock_amount: { type: "number", minimum: 0 },
  price: { type: "number", minimum: 0 },
};

export const saveSchema = {
  type: "object",
  required: ["article_number", "description", "price"],
  additionalProperties: false,
  properties: {
    ...baseSchema,
    article_number: { type: "string" },
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
