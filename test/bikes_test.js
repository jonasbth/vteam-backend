/**
 * Test of /bikes endpoint.
 * © Vteam 2023 Group 8.
 */
"use strict";

/* global it describe before after*/

process.env.NODE_ENV = "test";

const request = require('supertest');
const server = require('../server.js');
const db = require('../models/db_model.js').getDB();

const bikes = [
    {
        "id": 1,
        "city_id": 1,
        "user_id": 1,
        "status_id": 1,
        "station_id": 0,
        "park_id": 0,
        "lat": 56.18,
        "lon": 15.60,
        "speed": 7,
        "battery": 90
    },
    {
        "id": 2,
        "city_id": 1,
        "user_id": 0,
        "status_id": 3,
        "station_id": 1,
        "park_id": 1,
        "lat": 56.18,
        "lon": 15.61,
        "speed": 0,
        "battery": 100
    }
];

const bike = {
    "id": 3,
    "city_id": 1,
    "user_id": 0,
    "status_id": 0,
    "station_id": 2,
    "park_id": 2,
    "lat": 56.18,
    "lon": 15.59,
    "speed": 0,
    "battery": 100
};

const allBikes = [
    { id: 1, status_id: 1, lat: 56.18, lon: 15.6 },
    { id: 2, status_id: 3, lat: 56.18, lon: 15.61 }
];

function resetDB() {
    db.prepare('DELETE FROM bikes').run();
    db.prepare('DELETE FROM stations').run();

    for (const bike of bikes) {
        try {
            db.prepare(`
                INSERT INTO bikes (city_id, user_id, status_id, station_id,
                    park_id, lat, lon, speed, battery)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(bike.city_id, bike.user_id, bike.status_id, bike.station_id,
                bike.park_id, bike.lat, bike.lon, bike.speed, bike.battery);
            db.prepare(`
                INSERT INTO stations (city_id, num_free, num_total, lat, lon)
                VALUES (?, ?, ?, ?, ?)
            `).run(1, 10, 40, 56.60, 15.52);
        } catch (err) {
            console.log(err.message);
            shutDown();
        }
    }
}

function shutDown() {
    server.close(() => {
        console.log("Closing HTTP server.");
        console.log("Closing database connection.");
        db.close();
    });
}

before(function() {
    resetDB();
});

after(function() {
    shutDown();
});

describe('/bikes route', function() {
    describe('GET /bikes_pos/city/{city_id}', function() {
        it('should return bike positions of given city', function() {
            return request(server)
                .get('/api/v1/bikes_pos/city/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(allBikes);
        });
    });

    describe('GET /bikes/city/{city_id}', function() {
        it('should return all bikes of given city', function() {
            return request(server)
                .get('/api/v1/bikes/city/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(bikes);
        });
    });

    describe('GET /bikes/city/{city_id}/status/{status_id}', function() {
        it('should return all bikes of given city with status id', function() {
            return request(server)
                .get('/api/v1/bikes/city/1/status/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect([bikes[0]]);
        });
    });

    describe('GET /bikes/city/{city_id}/station/{station_id}', function() {
        it('should return all bikes of given city with station id', function() {
            return request(server)
                .get('/api/v1/bikes/city/1/station/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect([bikes[1]]);
        });
    });

    describe('GET /bikes/city/{city_id}/park_zone/{park_id}', function() {
        it('should return all bikes of given city with park id', function() {
            return request(server)
                .get('/api/v1/bikes/city/1/park_zone/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect([bikes[1]]);
        });
    });

    describe('GET /bikes/{id}', function() {
        it('should return a bike', function(done) {
            request(server)
                .get('/api/v1/bikes/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(bikes[0], done);
        });
    });

    describe('GET /bikes/user/{user_id}', function() {
        it('should return a bike', function(done) {
            request(server)
                .get('/api/v1/bikes/user/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(bikes[0], done);
        });
    });

    describe('POST /bikes', function() {
        it('should add a bike', function(done) {
            request(server)
                .post('/api/v1/bikes')
                .type('form')
                .send(bike)
                .expect(201)
                .expect('Content-Type', /json/)
                .expect({ count: 1, newId: 3, message: 'Ok' }, done);
        });
    });

    describe('PUT /bikes', function() {
        it('should update a bike', function(done) {
            request(server)
                .put('/api/v1/bikes')
                .type('form')
                .send({ ...bikes[0], user_id: 2 })
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });
    });

    describe('PUT /bikes error', function() {
        it('should give error if id not found', function(done) {
            request(server)
                .put('/api/v1/bikes')
                .type('form')
                .send({ id: 5, user_id: 2 })
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });

    describe('PUT /bikes/check_park_zone', function() {
        it('should check if bike in park zone and update park_id', function(done) {
            request(server)
                .put('/api/v1/bikes/check_park_zone')
                .type('form')
                .send({ ...bikes[0], park_id: 0 })
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, park_id: 0, message: 'Ok' }, done);
        });

        it('should give error if bike id not found', function(done) {
            request(server)
                .put('/api/v1/bikes/check_park_zone')
                .type('form')
                .send({ bike_id: 4, park_id: 0 })
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, park_id: 0, message: 'id not found' }, done);
        });
    });

    describe('PUT /bikes/start_charge', function() {
        it('should start charging bike', function(done) {
            request(server)
                .put('/api/v1/bikes/start_charge')
                .type('form')
                .send({ ...bike, bike_id: 3, station_id: 1})
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });

        it('should give error if bike is already charging', function(done) {
            request(server)
                .put('/api/v1/bikes/start_charge')
                .type('form')
                .send({ bike_id: 3, station_id: 1})
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'Bike is already charging' }, done);
        });

        it('should give error if bike id is not found', function(done) {
            request(server)
                .put('/api/v1/bikes/start_charge')
                .type('form')
                .send({ bike_id: 4, station_id: 1})
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'bike_id not found' }, done);
        });

        it('should give error if station id is not found', function(done) {
            request(server)
                .put('/api/v1/bikes/start_charge')
                .type('form')
                .send({ bike_id: 1, station_id: 4})
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'station_id not found' }, done);
        });
    });

    describe('PUT /bikes/stop_charge', function() {
        it('should stop charging bike', function(done) {
            request(server)
                .put('/api/v1/bikes/stop_charge')
                .type('form')
                .send({ ...bike, bike_id: 3, station_id: 1})
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });

        it('should give error if bike is not charging', function(done) {
            request(server)
                .put('/api/v1/bikes/stop_charge')
                .type('form')
                .send({ bike_id: 1, station_id: 1})
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'Bike is not charging' }, done);
        });

        it('should give error if bike id is not found', function(done) {
            request(server)
                .put('/api/v1/bikes/stop_charge')
                .type('form')
                .send({ bike_id: 4, station_id: 1})
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'bike_id not found' }, done);
        });

        // it('should give error if station id is not found', function(done) {
        //     request(server)
        //         .put('/api/v1/bikes/stop_charge')
        //         .type('form')
        //         .send({ bike_id: 2, station_id: 6})
        //         .expect(400)
        //         .expect('Content-Type', /json/)
        //         .expect({ count: 0, message: 'station_id not found' }, done);
        // });
    });

    describe('PUT /bikes/user_status_station_park', function() {
        it('should update bikes user, status, station and parking', function(done) {
            request(server)
                .put('/api/v1/bikes/user_status_station_park')
                .type('form')
                .send({ ...bike, user_id: 3, status_id: 1, station_id: 0, park_id: 0})
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });

        it('should give error if bike id not found', function(done) {
            request(server)
                .put('/api/v1/bikes/user_status_station_park')
                .type('form')
                .send({ bike_id: 4, user_id: 3, status_id: 1, station_id: 0, park_id: 0})
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });

    describe('PUT /bikes/pos_speed_batt', function() {
        it('should update bike position, speed and battery', function(done) {
            request(server)
                .put('/api/v1/bikes/pos_speed_batt')
                .type('form')
                .send({ ...bike, lat: 56.17, lon: 15.58, speed: 8, battery: 80})
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });

        it('should give error if bike id not found', function(done) {
            request(server)
                .put('/api/v1/bikes/pos_speed_batt')
                .type('form')
                .send({ bike_id: 4, lat: 56.17, lon: 15.58, speed: 8, battery: 80})
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });

    describe('DELETE /bikes/{id}', function() {
        it('should delete a bike', function(done) {
            request(server)
                .delete('/api/v1/bikes/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });
    });

    describe('DELETE /bikes/{id} error', function() {
        it('bike id not found', function(done) {
            request(server)
                .delete('/api/v1/bikes/1')
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });
});
