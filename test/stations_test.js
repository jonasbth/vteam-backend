/**
 * Test of /stations endpoint.
 * © Vteam 2023 Group 8.
 */
"use strict";

/* global it describe before after*/

process.env.NODE_ENV = "test";

const request = require('supertest');
const server = require('../server.js');
const db = require('../models/db_model.js').getDB();

const stations = [
    {
        "id": 1,
        "city_id": 1,
        "num_free": 14,
        "num_total": 50,
        "lat": 56.172,
        "lon": 15.586
    },
    {
        "id": 2,
        "city_id": 1,
        "num_free": 50,
        "num_total": 100,
        "lat": 56.193,
        "lon": 15.620
    }
];

const station = {
    "id": 3,
    "city_id": 1,
    "num_free": 0,
    "num_total": 80,
    "lat": 56.123,
    "lon": 15.621
};

function resetDB() {
    db.prepare('DELETE FROM stations').run();

    for (const station of stations) {
        try {
            db.prepare(`
                INSERT INTO stations (city_id, num_free, num_total, lat, lon)
                VALUES (?, ?, ?, ?, ?)
            `).run(station.city_id, station.num_free, station.num_total, station.lat, station.lon);
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

describe('/stations route', function() {
    describe('GET /stations/city/{city_id}', function() {
        it('should return list of all stations in given city', function() {
            return request(server)
                .get('/api/v1/stations/city/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(stations);
        });
    });

    describe('GET /stations/{id}', function() {
        it('should return a station', function(done) {
            request(server)
                .get('/api/v1/stations/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(stations[0], done);
        });
    });

    describe('POST /stations', function() {
        it('should add a station', function(done) {
            request(server)
                .post('/api/v1/stations')
                .type('form')
                .send(station)
                .expect(201)
                .expect('Content-Type', /json/)
                .expect({ count: 1, newId: 3, message: 'Ok' }, done);
        });
    });

    describe('PUT /stations', function() {
        it('should update a station', function(done) {
            request(server)
                .put('/api/v1/stations')
                .type('form')
                .send({ ...stations[0], num_free: 15 })
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });

        it('should give error if station id not found', function(done) {
            request(server)
                .put('/api/v1/stations')
                .type('form')
                .send({ station_id: 4, num_free: 15 })
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });

    describe('DELETE /stations/{id}', function() {
        it('should delete a station', function(done) {
            request(server)
                .delete('/api/v1/stations/3')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });
    });

    describe('DELETE /stations/{id} error', function() {
        it('station id not found', function(done) {
            request(server)
                .delete('/api/v1/stations/3')
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });
});
