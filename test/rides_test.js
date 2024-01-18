/**
 * Test of /rides endpoint.
 * © Vteam 2023 Group 8.
 */
"use strict";

/* global it describe before after*/

process.env.NODE_ENV = "test";

const request = require('supertest');
const server = require('../server.js');
const db = require('../models/db_model.js').getDB();

const rides = [
    {
        "id": 1,
        "start_time": "2023-12-17 19:36:24",
        "duration": "1.45",
        "start_lat": 56.21,
        "start_lon": 15.64,
        "start_park_id": 0,
        "stop_lat": 56.22,
        "stop_lon": 15.66,
        "user_id": 1,
        "bike_id": 1,
        "price": 21.35
    },
    {
        "id": 2,
        "start_time": "2023-12-18 10:37:37",
        "duration": "1.10",
        "start_lat": 56.21,
        "start_lon": 15.62,
        "start_park_id": 0,
        "stop_lat": 56.20,
        "stop_lon": 15.61,
        "user_id": 1,
        "bike_id": 2,
        "price": 23.3
    }
];

// const ride = {
//     "id": 3,
//     "start_time": "2023-12-17 19:36:24",
//     "duration": "",
//     "start_lat": 56.21,
//     "start_lon": 15.64,
//     "start_park_id": 0,
//     "stop_lat": 56.22,
//     "stop_lon": 15.66,
//     "user_id": 2,
//     "bike_id": 3,
//     "price": 0
// };

function resetDB() {
    db.prepare('DELETE FROM rides').run();

    for (const ride of rides) {
        try {
            db.prepare(`
                INSERT INTO rides (start_time, duration, start_lat, start_lon, start_park_id,
                    stop_lat, stop_lon, user_id, bike_id, price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(ride.start_time, ride.duration, ride.start_lat, ride.start_lon,
                ride.start_park_id, ride.stop_lat, ride.stop_lon, ride.user_id, ride.bike_id,
                ride.price);
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

describe('/rides route', function() {
    describe('GET /rides/user/{user_id}', function() {
        it('should return list of all rides for a user', function() {
            return request(server)
                .get('/api/v1/rides/user/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(rides);
        });
    });

    describe('GET /rides/bike/{bike_id}', function() {
        it('should return list of all rides for a bike', function() {
            return request(server)
                .get('/api/v1/rides/bike/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect([rides[0]]);
        });
    });

    describe('GET /rides/{id}', function() {
        it('should return a specific ride', function(done) {
            request(server)
                .get('/api/v1/rides/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(rides[0], done);
        });
    });

    // describe('POST /rides', function() {
    //     it('should start a new ride', function(done) {
    //         request(server)
    //             .post('/api/v1/rides')
    //             .type('form')
    //             .send({start_lat: ride.start_lat, start_lon: ride.start_lon,
    //                  user_id: ride.user_id, bike_id: ride.bike_id})
    //             .expect(201)
    //             .expect('Content-Type', /json/)
    //             .expect({ count: 1, newId: 3, message: 'Ok' }, done);
    //     });
    // });

    // describe('PUT /rides', function() {
    //     it('should finish new ride', function(done) {
    //         request(server)
    //             .put('/api/v1/rides')
    //             .type('form')
    //             .send(ride)
    //             .expect(201)
    //             .expect('Content-Type', /json/)
    //             .expect({ count: 1, newId: 3, message: 'Ok' }, done);
    //     });
    // });

    describe('DELETE /rides/{id}', function() {
        it('should delete a ride', function(done) {
            request(server)
                .delete('/api/v1/rides/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });
    });

    describe('DELETE /rides/{id} error', function() {
        it('ride id not found', function(done) {
            request(server)
                .delete('/api/v1/rides/1')
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });
});
