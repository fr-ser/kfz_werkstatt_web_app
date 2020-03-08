export interface GetClient {
  client_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  company_name?: string;
  birthday?: string;
  comment?: string;
  mobile_number?: string;
  zip_code?: number;
  city?: string;
  street_and_number?: string;
  cars: {
    car_id: string;
    license_plate: string;
  }[];
}

export interface SaveClient {
  client_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  company_name?: string;
  birthday?: string;
  comment?: string;
  mobile_number?: string;
  zip_code?: number;
  city?: string;
  street_and_number?: string;
  car_ids?: string[];
}

export type EditClient = Partial<Omit<SaveClient, "client_id">>;
