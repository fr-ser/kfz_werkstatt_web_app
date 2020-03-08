export const saveSchema = {
  type: "object",
  required: ["client_id", "first_name", "last_name"],
  additionalProperties: false,
  properties: {
    client_id: { type: "string" },
    first_name: { type: "string" },
    last_name: { type: "string" },
    email: { type: "string", format: "email" },
    phone_number: { type: "string" },
    company_name: { type: "string" },
    birthday: { type: "string", format: "date" },
    comment: { type: "string" },
    mobile_number: { type: "string" },
    zip_code: { type: "integer", minimum: 1, maximum: 99999 },
    city: { type: "string" },
    street_and_number: { type: "string" },
    car_ids: { type: "array", items: { type: "string" }, minItems: 1 },
  },
};

export const editSchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    first_name: { type: "string" },
    last_name: { type: "string" },
    email: { type: "string", format: "email" },
    phone_number: { type: "string" },
    company_name: { type: "string" },
    birthday: { type: "string", format: "date" },
    comment: { type: "string" },
    mobile_number: { type: "string" },
    zip_code: { type: "integer", minimum: 1, maximum: 99999 },
    city: { type: "string" },
    street_and_number: { type: "string" },
    car_ids: { type: "array", items: { type: "string" } },
  },
};
