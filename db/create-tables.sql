--
-- Schema for database bike-rentals.sqlite
-- © Jonas B., Vteam 2023 Group 8.
--

PRAGMA journal_mode=WAL;

DROP TABLE IF EXISTS cities;

CREATE TABLE cities
(
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    dlat REAL NOT NULL,
    dlon REAL NOT NULL
);

DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    ride_id INTEGER DEFAULT 0 NOT NULL,
    balance REAL DEFAULT 0 NOT NULL,
    bank_account TEXT DEFAULT '',
    recurring_withdraw REAL DEFAULT 0
);

DROP TABLE IF EXISTS bikes;

CREATE TABLE bikes
(
    id INTEGER PRIMARY KEY,
    city_id INTEGER NOT NULL,
    user_id INTEGER DEFAULT 0 NOT NULL,
    status_id INTEGER DEFAULT 0 NOT NULL,
    station_id INTEGER DEFAULT 0 NOT NULL,
    park_id INTEGER DEFAULT 0 NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    speed REAL DEFAULT 0 NOT NULL,
    battery REAL NOT NULL
);

DROP TABLE IF EXISTS stations;

CREATE TABLE stations
(
    id INTEGER PRIMARY KEY,
    city_id INTEGER NOT NULL,
    num_free INTEGER CHECK (num_free>=0) NOT NULL,
    num_total INTEGER NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL
);

DROP TABLE IF EXISTS park_zones;

CREATE TABLE park_zones
(
    id INTEGER PRIMARY KEY,
    city_id INTEGER NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    dlat REAL NOT NULL,
    dlon REAL NOT NULL,
    num_bikes INTEGER DEFAULT 0 NOT NULL
);

DROP TABLE IF EXISTS pricing;

CREATE TABLE pricing
(
    city_id INTEGER PRIMARY KEY,
    start_fee REAL NOT NULL,
    minute_fee REAL NOT NULL,
    extra_fee REAL NOT NULL,
    discount REAL NOT NULL
);

DROP INDEX IF EXISTS ind_rides_user;
DROP INDEX IF EXISTS ind_rides_bike;
DROP TABLE IF EXISTS rides;

CREATE TABLE rides
(
    id INTEGER PRIMARY KEY,
    start_time TEXT NOT NULL,
    duration TEXT,
    start_lat REAL NOT NULL,
    start_lon REAL NOT NULL,
    start_park_id INTEGER NOT NULL,
    stop_lat REAL,
    stop_lon REAL,
    user_id INTEGER NOT NULL,
    bike_id INTEGER NOT NULL,
    price REAL
);

CREATE INDEX ind_rides_user ON rides(user_id);
CREATE INDEX ind_rides_bike ON rides(bike_id);

