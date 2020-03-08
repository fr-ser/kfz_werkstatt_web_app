const baseProperties = {
  license_plate: { type: "string" },
  manufacturer: { type: "string" },
  model: { type: "string" },
  color: { type: "string" },
  displacement: { type: "string" },
  comment: { type: "string" },
  fuel: { type: "string" },
  performance: { type: "string" },
  tires: { type: "string", pattern: "^\\d{3}[/]\\d{2} \\w\\d{2} \\d{2}\\w$" },
  vin: { type: "string" },
  to_2: { type: "string" },
  to_3: { type: "string" },
  first_registration: { type: "string", format: "date" },
  oil_change_date: { type: "string", format: "date" },
  tuev_date: { type: "string", format: "date" },
  timing_belt_date: { type: "string", format: "date" },
  oil_change_mileage: { type: "number", minimum: 1 },
  timing_belt_mileage: { type: "number", minimum: 1 },
};

export const saveSchema = {
  type: "object",
  required: ["car_id", "license_plate", "manufacturer", "model"],
  additionalProperties: false,
  properties: {
    ...baseProperties,
    car_id: { type: "string", pattern: "^A\\d+$" },
    owner_ids: { type: "array", items: { type: "string" }, minItems: 1 },
  },
};

export const editSchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    ...baseProperties,
    owner_ids: { type: "array", items: { type: "string" } },
  },
};
