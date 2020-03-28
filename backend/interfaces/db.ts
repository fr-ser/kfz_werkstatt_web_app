import { OrderState, PaymentMethod, DocumentType } from "@backend/interfaces/api";

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

export interface DbOrder {
  order_id: string;
  car_id: string;
  client_id: string;
  title: string;
  date: string;
  payment_due_date: string;
  payment_method: PaymentMethod;
  state: OrderState;

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

export interface DbDocument {
  document_id: string;
  type: DocumentType;
  creation_date: string;
  order_id: string;
}
export interface DbDocumentClient {
  id: number;
  document_id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  zip_code?: number;
  city?: string;
  street_and_number?: string;
}

export interface DbDocumentCar {
  id: number;
  document_id: string;
  license_plate: string;
  manufacturer: string;
  model: string;
  vin?: string;
}

export interface DbDocumentOrder {
  id: number;
  document_id: string;
  title: string;
  date: string;
  payment_due_date: string;
  payment_method: PaymentMethod;
  mileage?: number;
}

export interface DbDocumentOrderHeader {
  id: number;
  document_id: string;
  position: number;
  header: string;
}

export interface DbDocumentOrderArticle {
  id: number;
  document_id: string;
  article_id: string;
  position: number;
  description: string;
  amount: number;
  price_per_item: number;
  discount: number;
}
