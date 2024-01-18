/**
 * Test of /users endpoint.
 * © Vteam 2023 Group 8.
 */
"use strict";

/* global it describe before after*/

process.env.NODE_ENV = "test";

const request = require('supertest');
const server = require('../server.js');
const db = require('../models/db_model.js').getDB();
const assert = require('node:assert').strict;

const users = [
    {
        "id": 1,
        "name": "User1",
        "ride_id": 1,
        "balance": 500,
        "bank_account": "81.938.131",
        "recurring_withdraw": 0
    },
    {
        "id": 2,
        "name": "User2",
        "ride_id": 0,
        "balance": 120,
        "bank_account": "13.145.435",
        "recurring_withdraw": 120
    }
];

const allUsers = [ { id: 1, name: 'User1' }, { id: 2, name: 'User2' } ];

const user = {
    "id": 3,
    "name": "User3",
    "ride_id": 0,
    "balance": 10,
    "bank_account": "34.252.552",
    "recurring_withdraw": 120
};

function resetDB() {
    db.prepare('DELETE FROM users').run();

    for (const user of users) {
        try {
            db.prepare(`
                INSERT INTO users (name, ride_id, balance, bank_account, recurring_withdraw)
                VALUES (?, ?, ?, ?, ?)
            `).run(user.name, user.ride_id, user.balance, user.bank_account,
                user.recurring_withdraw);
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

describe('/users route', function() {
    describe('GET /users', function() {
        it('should return list of all users', function() {
            return request(server)
                .get('/api/v1/users')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(allUsers);
        });
    });

    describe('GET /users/{id}', function() {
        it('should return a user', function(done) {
            request(server)
                .get('/api/v1/users/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(users[0], done);
        });
    });

    describe('POST /users', function() {
        it('should add a user', function(done) {
            request(server)
                .post('/api/v1/users')
                .type('form')
                .send(user)
                .expect(201)
                .expect('Content-Type', /json/)
                .expect({ count: 1, newId: 3, message: 'Ok' }, done);
        });
    });

    describe('POST /users error', function() {
        it('user already exists', function(done) {
            request(server)
                .post('/api/v1/users')
                .type('form')
                .send(users[0])
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, newId: -1, message: 'UNIQUE constraint failed: users.name' },
                    done);
        });
    });

    describe('PUT /users', function() {
        it('should update a user', function(done) {
            request(server)
                .put('/api/v1/users')
                .type('form')
                .send({ ...users[0], ride_id: 2 })
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });

        it('should give error if user id not found', function(done) {
            request(server)
                .put('/api/v1/users')
                .type('form')
                .send({ user_id: 4, ride_id: 2 })
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });

    describe('PUT /users/withdraw', function() {
        it('should withdraw from a users balance', function(done) {
            request(server)
                .put('/api/v1/users/withdraw')
                .type('form')
                .send({ ...users[0], amount: 100 })
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });

        it('should be less money in balance', function(done) {
            request(server)
                .get('/api/v1/users/1')
                .end((err, res) => {
                    assert.equal(res.body.balance, 400);
                    done();
                });
        });

        it('should give error if user id not found', function(done) {
            request(server)
                .put('/api/v1/users/withdraw')
                .type('form')
                .send({ user_id: 4, amount: 100 })
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });

    describe('DELETE /users/{id}', function() {
        it('should delete a user', function(done) {
            request(server)
                .delete('/api/v1/users/3')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect({ count: 1, message: 'Ok' }, done);
        });
    });

    describe('DELETE /users/{id} error', function() {
        it('user id not found', function(done) {
            request(server)
                .delete('/api/v1/users/3')
                .expect(400)
                .expect('Content-Type', /json/)
                .expect({ count: 0, message: 'id not found' }, done);
        });
    });
});
