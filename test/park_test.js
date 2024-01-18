/**
 * Test of /park_zones endpoint.
 * © Vteam 2023 Group 8.
 */
"use strict";

/* global it describe before after*/

process.env.NODE_ENV = "test";

const request = require('supertest');
const server = require('../server.js');
const db = require('../models/db_model.js').getDB();

const parkZones = [
    {
        "id": 1,
        "city_id": 2,
        "lat": 56.172,
        "lon": 15.586,
        "dlat": 56.172,
        "dlon": 15.586,
        "num_bikes": 10
    },
    {
        "id": 2,
        "city_id": 2,
        "lat": 56.193,
        "lon": 15.620,
        "dlat": 56.193,
        "dlon": 15.620,
        "num_bikes": 10
    }
];

const parkZone = {
    "id": 3,
    "city_id": 2,
    "lat": 56.123,
    "lon": 15.621,
    "dlat": 56.123,
    "dlon": 15.621,
    "num_bikes": 0
};

function resetDB() {
    db.prepare('DELETE FROM park_zones').run();

    for (const zone of parkZones) {
        try {
            db.prepare(`
                INSERT INTO park_zones (city_id, lat, lon, dlat, dlon, num_bikes)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(zone.city_id, zone.lat, zone.lon, zone.dlat, zone.dlon, zone.num_bikes);
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

describe('/park_zones route', function() {
    describe('GET /park_zones/city/{city_id}', function() {
        it('should return list of all park zones in given city', function() {
            return request(server)
                .get('/api/v1/park_zones/city/2')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(parkZones);
        });
    });

    describe('GET /park_zones/{id}', function() {
        it('should return a park zone', function(done) {
            request(server)
                .get('/api/v1/park_zones/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(parkZones[0], done);
        });
    });

    describe('POST /park_zones', function() {
        it('should add a parking zone', function(done) {
            request(server)
                .post('/api/v1/park_zones')
                .type('form')
                .send(parkZone)
                .expect(201)
                .expect('Content-Type', /json/)
                .expect({ count: 1, newId: 3, message: 'Ok' }, done);
        });

        it('should return added park zone', function(done) {
            request(server)
                .get('/api/v1/park_zones/3')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(parkZone, done);
        });
    });

    describe('PUT /park_zones', function() {
        it('should update a parking zone', function(done) {
            request(server)
                .put('/api/v1/park_zones')
                .type('form')
                .send({ ...parkZones[0], num_bikes: 15 })
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });

        it('should give error if park zone id not found', function(done) {
            request(server)
                .put('/api/v1/park_zones')
                .type('form')
                .send({ park_id: 4, num_bikes: 15 })
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });

    describe('DELETE /park_zones/{id}', function() {
        it('should delete a parking zone', function(done) {
            request(server)
                .delete('/api/v1/park_zones/3')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });
    });

    describe('DELETE /park_zones/{id} error', function() {
        it('park zone id not found', function(done) {
            request(server)
                .delete('/api/v1/park_zones/3')
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });
});
