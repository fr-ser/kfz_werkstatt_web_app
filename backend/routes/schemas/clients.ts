export const bodyJsonSchema = {
  type: "object",
  required: ["client_id", "first_name", "last_name"],
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
    zip_code: { type: "number" },
    city: { type: "string" },
    street_and_number: { type: "string" },
  },
};
