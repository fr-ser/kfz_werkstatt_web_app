import { DbArticle } from "@backend/interfaces/db";

interface ApiClient {
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
}

export interface GetClient extends ApiClient {
  cars: {
    car_id: string;
    license_plate: string;
  }[];
}

export interface SaveClient extends ApiClient {
  car_ids?: string[];
}

export type EditClient = Partial<Omit<SaveClient, "client_id">>;

interface ApiCar {
  car_id: string;
  license_plate: string;
  manufacturer: string;
  model: string;

  first_registration?: string;
  color?: string;
  displacement?: string;
  comment?: string;
  fuel?: string;
  performance?: string;
  oil_change_date?: string;
  oil_change_mileage?: number;
  tires?: string;
  tuev_date?: string;
  vin?: string;
  to_2?: string;
  to_3?: string;
  timing_belt_date?: string;
  timing_belt_mileage?: number;
}

export interface GetCar extends ApiCar {
  owners: {
    client_id: string;
    name: string;
  }[];
}

export interface SaveCar extends ApiCar {
  owner_ids?: string[];
}
export type EditCar = Partial<Omit<SaveCar, "car_id">>;

export type GetArticle = DbArticle;
export type SaveArticle = DbArticle;
export type EditArticle = Partial<Omit<SaveArticle, "article_id">>;
