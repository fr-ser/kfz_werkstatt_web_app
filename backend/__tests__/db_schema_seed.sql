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
    -- ,   auftraege TEXT
    -- ,   autos TEXT
);

CREATE TABLE car (
        car_id TEXT PRIMARY KEY
    ,   license_plate_numer TEXT NOT NULL
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
    -- kunden
    -- auftraege
);


CREATE TABLE article (
        article_id TEXT PRIMARY KEY
    ,   description TEXT NOT NULL
    ,   article_number TEXT
    ,   stock_amount NUMERIC
    ,   price NUMERIC
);
