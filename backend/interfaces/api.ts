import {
  DbArticle,
  DbOrder,
  DbOrderItemArticle,
  DbOrderItemHeader,
  DbDocument,
  DbDocumentOrder,
  DbDocumentClient,
  DbDocumentCar,
} from "@backend/interfaces/db";

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

export type ApiOrderItemArticle = Omit<DbOrderItemArticle, "id" | "order_id">;
export type ApiOrderItemHeader = Omit<DbOrderItemHeader, "id" | "order_id">;

export interface GetOrder extends DbOrder {
  items: (ApiOrderItemArticle | ApiOrderItemHeader)[];
}
export interface SaveOrder extends DbOrder {
  items: (ApiOrderItemArticle | ApiOrderItemHeader)[];
}
export interface EditOrder extends Partial<Omit<SaveOrder, "order_id">> {
  items?: (ApiOrderItemArticle | ApiOrderItemHeader)[];
}

export interface GetDocument extends DbDocument {
  order: Omit<DbDocumentOrder, "id">;
  client: Omit<DbDocumentClient, "id">;
  car: Omit<DbDocumentCar, "id">;
  items: (ApiOrderItemArticle | ApiOrderItemHeader)[];
}

export interface SaveDocument extends Omit<DbDocument, "creation_date"> {
  client_id: string;
  car_id: string;
}
