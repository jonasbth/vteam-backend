/**
 * Test of /pricing endpoint.
 * © Vteam 2023 Group 8.
 */
"use strict";

/* global it describe before after*/

process.env.NODE_ENV = "test";

const request = require('supertest');
const server = require('../server.js');
const db = require('../models/db_model.js').getDB();
const assert = require('node:assert').strict;

const pricings = [
    {
        "city_id": 1,
        "start_fee": 10,
        "minute_fee": 3,
        "extra_fee": 10,
        "discount": 10
    },
    {
        "city_id": 2,
        "start_fee": 10,
        "minute_fee": 3,
        "extra_fee": 10,
        "discount": 10
    }
];

const pricing = {
    "city_id": 3,
    "start_fee": 10,
    "minute_fee": 3,
    "extra_fee": 10,
    "discount": 10
};

function resetDB() {
    db.prepare('DELETE FROM pricing').run();

    for (const price of pricings) {
        try {
            db.prepare(`
                INSERT INTO pricing (city_id, start_fee, minute_fee, extra_fee, discount)
                VALUES (?, ?, ?, ?, ?)
            `).run(price.city_id, price.start_fee, price.minute_fee,
                price.extra_fee, price.discount);
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

describe('/pricing route', function() {
    describe('GET /pricing/city/{city_id}', function() {
        it('should return pricing in given city', function() {
            return request(server)
                .get('/api/v1/pricing/city/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(pricings[0]);
        });
    });

    describe('POST /pricing', function() {
        it('should add a new pricing', function(done) {
            request(server)
                .post('/api/v1/pricing')
                .type('form')
                .send(pricing)
                .expect(201)
                .expect('Content-Type', /json/)
                .expect({ count: 1, newId: 3, message: 'Ok' }, done);
        });

        it('should give error if adding same pricing', function(done) {
            request(server)
                .post('/api/v1/pricing')
                .type('form')
                .send(pricing)
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, newId: -1,
                    message: 'UNIQUE constraint failed: pricing.city_id' }, done);
        });
    });

    describe('PUT /pricing', function() {
        it('should update a pricing', function(done) {
            request(server)
                .put('/api/v1/pricing')
                .type('form')
                .send({ ...pricings[0], start_fee: 11 })
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });

        it('should have updated start fee for updated pricing', function(done) {
            request(server)
                .get('/api/v1/pricing/city/1')
                .end((err, res) => {
                    assert.equal(res.body.start_fee, 11);
                    done();
                });
        });
    });

    describe('DELETE /pricing/{city_id}', function() {
        it('should delete a pricing', function(done) {
            request(server)
                .delete('/api/v1/pricing/3')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });
    });

    describe('DELETE /pricing/{city_id} error', function() {
        it('pricing not found', function(done) {
            request(server)
                .delete('/api/v1/pricing/3')
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });
});
