CREATE TABLE client (
        client_id TEXT PRIMARY KEY
    ,   first_name TEXT NOT NULL
    ,   last_name TEXT NOT NULL
    ,   email TEXT
    ,   phone_number TEXT
    ,   company_name TEXT
    ,   birthday DATE
    ,   comment TEXT
    ,   mobile_number TEXT
    ,   zip_code INTEGER
    ,   city TEXT
    ,   street_and_number TEXT
);

CREATE TABLE car (
        car_id TEXT PRIMARY KEY
    ,   license_plate TEXT NOT NULL
    ,   manufacturer TEXT NOT NULL
    ,   model TEXT NOT NULL
    ,   first_registration DATE
    ,   color TEXT
    ,   displacement TEXT
    ,   comment TEXT
    ,   fuel TEXT
    ,   performance TEXT
    ,   oil_change_date DATE
    ,   oil_change_mileage NUMERIC
    ,   tires TEXT
    ,   tuev_date DATE
    ,   vin TEXT
    ,   to_2 TEXT
    ,   to_3 TEXT
    ,   timing_belt_date DATE
    ,   timing_belt_mileage NUMERIC
);

CREATE TABLE car_ownership (
        car_id TEXT NOT NULL REFERENCES car(car_id)
    ,   client_id TEXT NOT NULL REFERENCES client(client_id)
    ,   PRIMARY KEY(car_id, client_id)
);

CREATE TABLE article (
        article_number TEXT PRIMARY KEY
    ,   description TEXT NOT NULL
    ,   price NUMERIC NOT NULL
    ,   stock_amount NUMERIC
);

CREATE TYPE payment_method AS ENUM ('cash', 'remittance');
CREATE TYPE order_state AS ENUM ('in_progress', 'done', 'cancelled');

CREATE TABLE order_ (
        order_id TEXT PRIMARY KEY
    ,   car_id TEXT NOT NULL REFERENCES car(car_id)
    ,   client_id TEXT NOT NULL REFERENCES client(client_id)
    ,   title TEXT NOT NULL
    ,   date Date NOT NULL
    ,   payment_due_date Date NOT NULL
    ,   payment_method payment_method NOT NULL
    ,   state order_state NOT NULL
    ,   description TEXT
    ,   mileage NUMERIC
);

CREATE TABLE order_item_header (
        id SERIAL PRIMARY KEY
    ,   order_id TEXT NOT NULL REFERENCES order_(order_id)
    ,   position INTEGER NOT NULL
    ,   header TEXT NOT NULL
);

CREATE TABLE order_item_article (
        id SERIAL PRIMARY KEY
    ,   order_id TEXT NOT NULL REFERENCES order_(order_id)
    -- can come from article table but does not have to
    ,   article_id TEXT NOT NULL
    ,   position INTEGER NOT NULL
    ,   description TEXT NOT NULL
    ,   amount NUMERIC NOT NULL
    ,   price_per_item NUMERIC NOT NULL
    ,   discount NUMERIC NOT NULL
);

CREATE TYPE document_type AS ENUM ('quote', 'invoice');

CREATE TABLE document (
        document_id TEXT PRIMARY KEY
    ,   type document_type NOT NULL
    ,   creation_date DATE NOT NULL
    ,   order_id TEXT NOT NULL REFERENCES order_(order_id)
);

CREATE TABLE document_client (
        id SERIAL PRIMARY KEY
    ,   document_id TEXT NOT NULL REFERENCES document(document_id)
    ,   client_id TEXT NOT NULL
    ,   first_name TEXT NOT NULL
    ,   last_name TEXT NOT NULL
    ,   company_name TEXT
    ,   zip_code INTEGER
    ,   city TEXT
    ,   street_and_number TEXT
);

CREATE TABLE document_car (
        id SERIAL PRIMARY KEY
    ,   document_id TEXT NOT NULL REFERENCES document(document_id)
    ,   license_plate TEXT NOT NULL
    ,   manufacturer TEXT NOT NULL
    ,   model TEXT NOT NULL
    ,   vin TEXT
);

CREATE TABLE document_order (
        id SERIAL PRIMARY KEY
    ,   document_id TEXT NOT NULL REFERENCES document(document_id)
    ,   title TEXT NOT NULL
    ,   date Date NOT NULL
    ,   payment_due_date Date NOT NULL
    ,   payment_method payment_method NOT NULL
    ,   mileage NUMERIC
);

CREATE TABLE document_order_item_header (
        id SERIAL PRIMARY KEY
    ,   document_id TEXT NOT NULL REFERENCES document(document_id)
    ,   position INTEGER NOT NULL
    ,   header TEXT NOT NULL
);

CREATE TABLE document_order_item_article (
        id SERIAL PRIMARY KEY
    ,   document_id TEXT NOT NULL REFERENCES document(document_id)
    ,   article_id TEXT NOT NULL
    ,   position INTEGER NOT NULL
    ,   description TEXT NOT NULL
    ,   amount NUMERIC NOT NULL
    ,   price_per_item NUMERIC NOT NULL
    ,   discount NUMERIC NOT NULL
);
