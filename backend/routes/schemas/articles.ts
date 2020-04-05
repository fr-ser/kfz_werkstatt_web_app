const properties = {
  description: { type: "string" },
  stock_amount: { type: "number", minimum: 0 },
  price: { type: "number", minimum: 0 },
  article_number: { type: "string" },
};

export const saveSchema = {
  type: "object",
  required: ["article_number", "description", "price"],
  additionalProperties: false,
  properties,
};

export const editSchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties,
};
