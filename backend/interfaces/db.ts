export interface DbClient {
  client_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  company_name?: string;
  birthday?: Date;
  comment?: string;
  mobile_number?: string;
  zip_code?: number;
  city?: string;
  street_and_number?: string;
}

export interface DbCar {
  car_id: string;
  license_plate_numer: string;
  manufacturer: string;
  model: string;
  first_registration?: Date;
  color?: string;
  displacement?: string;
  comment?: string;
  fuel?: string;
  performance?: string;
  oil_change_date?: Date;
  oil_change_mileage?: number;
  tires?: string;
  tuev_date?: Date;
  vin?: string;
  to_2?: string;
  to_3?: string;
  timing_belt_date?: Date;
  timing_belt_mileage?: number;
}

export interface DbArticle {
  article_id: string;
  description: string;
  article_number?: string;
  stock_amount?: number;
  price?: number;
}