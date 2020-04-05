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

export interface GetArticle {
  article_number: string;
  description: string;
  price: number;
  stock_amount?: number;
}
export type SaveArticle = GetArticle;
// TODO can you edit the articleNumber?
export type EditArticle = Partial<SaveArticle>;

export interface ApiOrderItemArticle {
  article_id: string;
  position: number;
  description: string;
  amount: number;
  price_per_item: number;
  discount: number;
}
export interface ApiOrderItemHeader {
  position: number;
  header: string;
}

export enum PaymentMethod {
  cash = "cash",
  remittance = "remittance",
}

export enum OrderState {
  in_progress = "in_progress",
  done = "done",
  cancelled = "cancelled",
}

export interface GetOrder {
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
  items: (ApiOrderItemArticle | ApiOrderItemHeader)[];
}
export type SaveOrder = GetOrder;
export interface EditOrder extends Partial<Omit<SaveOrder, "order_id">> {
  items?: (ApiOrderItemArticle | ApiOrderItemHeader)[];
}

export enum DocumentType {
  quote = "quote",
  invoice = "invoice",
}

export interface GetDocument {
  document_id: string;
  type: DocumentType;
  creation_date: string;
  order_id: string;
  order: {
    document_id: string;
    title: string;
    date: string;
    payment_due_date: string;
    payment_method: PaymentMethod;
    mileage?: number;
  };
  client: {
    document_id: string;
    client_id: string;
    first_name: string;
    last_name: string;
    company_name?: string;
    zip_code?: number;
    city?: string;
    street_and_number?: string;
  };
  car: {
    document_id: string;
    license_plate: string;
    manufacturer: string;
    model: string;
    vin?: string;
  };
  items: (ApiOrderItemArticle | ApiOrderItemHeader)[];
}

export interface SaveDocument {
  document_id: string;
  type: DocumentType;
  order_id: string;
  client_id: string;
  car_id: string;
}
