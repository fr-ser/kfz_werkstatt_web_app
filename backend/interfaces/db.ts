export interface DbClient {
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

export interface DbCar {
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

export interface DbArticle {
  article_id: string;
  description: string;
  article_number?: string;
  stock_amount?: number;
  price?: number;
}

export enum DbPaymentMethod {
  cash = "cash",
  remittance = "remittance",
}
export enum DbOrderState {
  in_progress = "in_progress",
  done = "done",
  cancelled = "cancelled",
}

export interface DbOrder {
  order_id: string;
  car_id: string;
  client_id: string;
  title: string;
  date: string;
  payment_due_date: string;
  payment_method: DbPaymentMethod;
  state: DbOrderState;

  description?: string;
  mileage?: number;
}

export interface DbOrderItemHeader {
  id: number;
  order_id: string;
  position: number;
  header: string;
}

export interface DbOrderItemArticle {
  id: number;
  order_id: string;
  article_id: string;
  position: number;
  description: string;
  amount: number;
  price_per_item: number;
  discount: number;
}

export enum DbDocumentType {
  quote = "quote",
  invoice = "invoice",
}

export interface DbDocument {
  document_id: string;
  art: DbDocumentType;
  creation_date: string;
  title: string;
  client_id: string;
  car_id: string;
  order_id: string;
  document_content: Object;
}
