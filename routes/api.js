/**
 * API routes.
 * © Jonas B., Vteam 2023 Group 8.
 */
"use strict";

const express = require('express');
const router = express.Router();
const db = require("../models/db_model.js");

const urlencodedParser = express.urlencoded({ extended: false });

/**
 * Middleware logging request to console.
 */
function logToConsole(req, res, next) {
    console.log(`${new Date().toLocaleTimeString('sv-SE')} ${req.method} ${req.url}`);
    next();
}

/**
 * Get all cities.
 */
router.get('/cities', (req, res) => {
    const result = db.getAllCities();

    return res.status(200).json(result);
});

/**
 * Get a specific city.
 */
router.get('/cities/:id', (req, res) => {
    const result = db.getCity(req.params.id);

    return res.status(200).json(result);
});

/**
 * Add a new city.
 */
router.post('/cities', urlencodedParser, (req, res) => {
    const result = db.addCity(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            newId: -1,
            message: result.message
        });
    }

    return res.status(201).json({
        count: result.changes,
        newId: result.lastInsertRowid,
        message: 'Ok'
    });
});

/**
 * Update a city.
 */
router.put('/cities', urlencodedParser, (req, res) => {
    const result = db.updateCity(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Delete a city.
 */
router.delete('/cities/:id', (req, res) => {
    const result = db.deleteCity(req.params.id);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Get all users.
 */
router.get('/users', (req, res) => {
    const result = db.getAllUsers();

    return res.status(200).json(result);
});

/**
 * Get a specific user.
 */
router.get('/users/:id', (req, res) => {
    const result = db.getUser(req.params.id);

    return res.status(200).json(result);
});

/**
 * Add a new user.
 */
router.post('/users', urlencodedParser, (req, res) => {
    const result = db.addUser(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            newId: -1,
            message: result.message
        });
    }

    return res.status(201).json({
        count: result.changes,
        newId: result.lastInsertRowid,
        message: 'Ok'
    });
});

/**
 * Update a user.
 */
router.put('/users', urlencodedParser, (req, res) => {
    const result = db.updateUser(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Withdraw from a user's balance.
 * A deposit is a negative withdrawal.
 * A negative balance is allowed.
 */
router.put('/users/withdraw', urlencodedParser, (req, res) => {
    const result = db.withdrawUser(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Delete a user.
 */
router.delete('/users/:id', (req, res) => {
    const result = db.deleteUser(req.params.id);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Get all bike positions and status of a city.
 */
router.get('/bikes_pos/city/:city_id', (req, res) => {
    const result = db.getBikesPosCity(req.params.city_id);

    return res.status(200).json(result);
});

/**
 * Get all bikes of a city.
 */
router.get('/bikes/city/:city_id', (req, res) => {
    const result = db.getBikesCity(req.params.city_id);

    return res.status(200).json(result);
});

/**
 * Get all bikes of a city and status.
 */
router.get('/bikes/city/:city_id/status/:status_id', (req, res) => {
    const result = db.getBikesCityStatus(req.params.city_id, req.params.status_id);

    return res.status(200).json(result);
});

/**
 * Get all bikes of a city and charging station.
 */
router.get('/bikes/city/:city_id/station/:station_id', (req, res) => {
    const result = db.getBikesCityStation(req.params.city_id, req.params.station_id);

    return res.status(200).json(result);
});

/**
 * Get all bikes of a city and parking zone.
 */
router.get('/bikes/city/:city_id/park_zone/:park_id', (req, res) => {
    const result = db.getBikesCityParkZone(req.params.city_id, req.params.park_id);

    return res.status(200).json(result);
});

/**
 * Get a specific bike.
 */
router.get('/bikes/:id', (req, res) => {
    const result = db.getBike(req.params.id);

    return res.status(200).json(result);
});

/**
 * Get a bike of a user.
 */
router.get('/bikes/user/:user_id', (req, res) => {
    const result = db.getBikeUser(req.params.user_id);

    return res.status(200).json(result);
});

/**
 * Add a new bike.
 */
router.post('/bikes', urlencodedParser, (req, res) => {
    const result = db.addBike(req.body);

    return res.status(201).json({
        count: result.changes,
        newId: result.lastInsertRowid,
        message: 'Ok'
    });
});

/**
 * Update all bike properties.
 */
router.put('/bikes', urlencodedParser, (req, res) => {
    const result = db.updateBike(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Check if bike is in a parking zone and update park_id.
 */
router.put('/bikes/check_park_zone', urlencodedParser, (req, res) => {
    const result = db.updateBikeCheckParkZone(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            park_id: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        park_id: result.park_id,
        message: 'Ok'
    });
});

/**
 * Start charging a bike.
 */
router.put('/bikes/start_charge', urlencodedParser, (req, res) => {
    const result = db.updateBikeStartCharge(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'bike_id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Stop charging a bike.
 */
router.put('/bikes/stop_charge', urlencodedParser, (req, res) => {
    const result = db.updateBikeStopCharge(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'bike_id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Update bike user, status, charging station and parking zone.
 */
router.put('/bikes/user_status_station_park', urlencodedParser, (req, res) => {
    const result = db.updateBikeUserStatusStationPark(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Update bike position, speed and battery.
 */
router.put('/bikes/pos_speed_batt', urlencodedParser, (req, res) => {
    const result = db.updateBikePosSpeedBatt(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Delete a bike.
 */
router.delete('/bikes/:id', (req, res) => {
    const result = db.deleteBike(req.params.id);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Get all charging stations of a city.
 */
router.get('/stations/city/:city_id', (req, res) => {
    const result = db.getStationsCity(req.params.city_id);

    return res.status(200).json(result);
});

/**
 * Get a specific charging station.
 */
router.get('/stations/:id', (req, res) => {
    const result = db.getStation(req.params.id);

    return res.status(200).json(result);
});

/**
 * Add a new charging station.
 */
router.post('/stations', urlencodedParser, (req, res) => {
    const result = db.addStation(req.body);

    return res.status(201).json({
        count: result.changes,
        newId: result.lastInsertRowid,
        message: 'Ok'
    });
});

/**
 * Update a charging station.
 */
router.put('/stations', urlencodedParser, (req, res) => {
    const result = db.updateStation(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Add number of free positions.
 * A positive number increases num_free.
 * A negative number decreases num_free.
 *
router.put('/stations/addfree', urlencodedParser, (req, res) => {
    const result = db.addNumFreeStation(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Delete a charging station.
 */
router.delete('/stations/:id', (req, res) => {
    const result = db.deleteStation(req.params.id);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Get all parking zones of a city.
 */
router.get('/park_zones/city/:city_id', (req, res) => {
    const result = db.getParkZonesCity(req.params.city_id);

    return res.status(200).json(result);
});

/**
 * Get a specific parking zone.
 */
router.get('/park_zones/:id', (req, res) => {
    const result = db.getParkZone(req.params.id);

    return res.status(200).json(result);
});

/**
 * Add a new parking zone.
 */
router.post('/park_zones', urlencodedParser, (req, res) => {
    const result = db.addParkZone(req.body);

    return res.status(201).json({
        count: result.changes,
        newId: result.lastInsertRowid,
        message: 'Ok'
    });
});

/**
 * Update a parking zone.
 */
router.put('/park_zones', urlencodedParser, (req, res) => {
    const result = db.updateParkZone(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Delete a parking zone.
 */
router.delete('/park_zones/:id', (req, res) => {
    const result = db.deleteParkZone(req.params.id);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Get pricing of a city.
 */
router.get('/pricing/city/:city_id', (req, res) => {
    const result = db.getPricingCity(req.params.city_id);

    return res.status(200).json(result);
});

/**
 * Add a new pricing.
 */
router.post('/pricing', urlencodedParser, (req, res) => {
    const result = db.addPricing(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            newId: -1,
            message: result.message
        });
    }

    return res.status(201).json({
        count: result.changes,
        newId: result.lastInsertRowid,
        message: 'Ok'
    });
});

/**
 * Update pricing.
 */
router.put('/pricing', urlencodedParser, (req, res) => {
    const result = db.updatePricing(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Delete a pricing.
 */
router.delete('/pricing/:city_id', (req, res) => {
    const result = db.deletePricing(req.params.city_id);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});

/**
 * Get all rides of a user.
 */
router.get('/rides/user/:user_id', (req, res) => {
    const result = db.getRidesUser(req.params.user_id);

    return res.status(200).json(result);
});

/**
 * Get all rides of a bike.
 */
router.get('/rides/bike/:bike_id', (req, res) => {
    const result = db.getRidesBike(req.params.bike_id);

    return res.status(200).json(result);
});

/**
 * Get a specific ride.
 */
router.get('/rides/:id', (req, res) => {
    const result = db.getRide(req.params.id);

    return res.status(200).json(result);
});

/**
 * Start a new ride.
 */
router.post('/rides', logToConsole, urlencodedParser, (req, res) => {
    const result = db.startRide(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            newId: -1,
            message: result.message
        });
    }

    return res.status(201).json({
        count: result.changes,
        newId: result.lastInsertRowid,
        message: 'Ok'
    });
});

/**
 * Finish a ride.
 * Calculate price and withdraw user's balance.
 */
router.put('/rides', logToConsole, urlencodedParser, (req, res) => {
    const result = db.finishRide(req.body);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            price: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        price: result.price,
        message: 'Ok'
    });
});

/**
 * Delete a ride.
 */
router.delete('/rides/:id', (req, res) => {
    const result = db.deleteRide(req.params.id);

    if (result.changes === 0) {
        return res.status(400).json({
            count: 0,
            message: result.message ? result.message : 'id not found'
        });
    }

    return res.status(200).json({
        count: result.changes,
        message: 'Ok'
    });
});


module.exports = router;
