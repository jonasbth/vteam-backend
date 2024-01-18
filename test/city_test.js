/**
 * Test of /cities endpoint.
 * © Jonas B., Vteam 2023 Group 8.
 */
"use strict";

/* global it describe before after*/

process.env.NODE_ENV = "test";

const request = require('supertest');
const server = require('../server.js');
const db = require('../models/db_model.js').getDB();

const cities = [
    {
        "id": 1,
        "name": "Karlskrona",
        "lat": 56.193,
        "lon": 15.628,
        "dlat": 0.02,
        "dlon": 0.03
    },
    {
        "id": 2,
        "name": "Stockholm",
        "lat": 59.325,
        "lon": 18.071,
        "dlat": 0.08,
        "dlon": 0.2
    }
];

const helsingborg = {
    "id": 3,
    "name": "Helsingborg",
    "lat": 56.046,
    "lon": 12.72,
    "dlat": 0.036,
    "dlon": 0.034
};

function resetDB() {
    db.prepare('DELETE FROM cities').run();

    for (const city of cities) {
        try {
            db.prepare(`
                INSERT INTO cities (name, lat, lon, dlat, dlon)
                VALUES (?, ?, ?, ?, ?)
            `).run(city.name, city.lat, city.lon, city.dlat, city.dlon);
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

// Return the request (which is compatible with JavaScript promises)
describe('GET /cities', function() {
    it('should return list of all cities', function() {
        return request(server)
            .get('/api/v1/cities')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(cities);
    });
});

// Alternatively use the done() callback
describe('GET /cities/{id}', function() {
    it('should return a city', function(done) {
        request(server)
            .get('/api/v1/cities/1')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(cities[0], done);
    });
});

describe('POST /cities', function() {
    it('should add a city', function(done) {
        request(server)
            .post('/api/v1/cities')
            .type('form')
            .send(helsingborg)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect({ count: 1, newId: 3, message: 'Ok' }, done);
    });
});

describe('POST /cities error', function() {
    it('city name already exists', function(done) {
        request(server)
            .post('/api/v1/cities')
            .type('form')
            .send(cities[0])
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({ count: 0, newId: -1, message: 'UNIQUE constraint failed: cities.name' },
                done);
    });
});

describe('PUT /cities', function() {
    it('should update a city', function(done) {
        request(server)
            .put('/api/v1/cities')
            .type('form')
            .send({ ...cities[0], dlat: 0.022 })
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({ count: 1, message: 'Ok' }, done);
    });
});

describe('DELETE /cities/{id}', function() {
    it('should delete a city', function(done) {
        request(server)
            .delete('/api/v1/cities/2')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({ count: 1, message: 'Ok' }, done);
    });
});

describe('DELETE /cities/{id} error', function() {
    it('city id not found', function(done) {
        request(server)
            .delete('/api/v1/cities/4')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({ count: 0, message: 'id not found' }, done);
    });
});

