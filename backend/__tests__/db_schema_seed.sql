CREATE TABLE clients (
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