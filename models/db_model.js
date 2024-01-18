/**
 * Database model using SQLite.
 * © Jonas B., Vteam 2023 Group 8.
 */
"use strict";

let dbName = "bike-rentals";

if (process.env.NODE_ENV === 'test') {
    dbName = "bike-rentals-test";
}

const db = require('better-sqlite3')(`./db/${dbName}.sqlite`);

/**
 * Check if a position (lat, lon) is in a parking zone.
 * Return the park_id (0 if not in a zone).
 */
function posInParkingZone(cityId, lat, lon) {
    const parkZones = db.prepare(`SELECT * FROM park_zones WHERE city_id = ?`);
    let parkId = 0;

    for (const zone of parkZones.iterate(cityId)) {
        if (lat >= zone.lat - zone.dlat && lat <= zone.lat + zone.dlat &&
            lon >= zone.lon - zone.dlon && lon <= zone.lon + zone.dlon) {
            parkId = zone.id;
            break;
        }
    }

    return parkId;
}

const dbModel = {
    getDB: function () {
        return db;
    },

    closeDB: function () {
        db.close();
    },

    /**
     * Cities
     */
    getAllCities: function () {
        return db.prepare('SELECT * FROM cities').all();
    },

    getCity: function (id) {
        return db.prepare('SELECT * FROM cities WHERE id = ?').get(id);
    },

    addCity: function (body) {
        let result;

        try {
            result = db.prepare(`
                INSERT INTO cities (name, lat, lon, dlat, dlon)
                VALUES (?, ?, ?, ?, ?)
            `).run(body.name, body.lat, body.lon, body.dlat, body.dlon);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    updateCity: function (body) {
        let result;

        try {
            result = db.prepare(`
                UPDATE cities SET (name, lat, lon, dlat, dlon) = (?, ?, ?, ?, ?)
                WHERE id = ?
            `).run(body.name, body.lat, body.lon, body.dlat, body.dlon, body.id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    deleteCity: function (id) {
        const result = db.prepare('DELETE FROM cities WHERE id = ?').run(id);

        return result;
    },

    /**
     * Users
     */
    getAllUsers: function () {
        return db.prepare('SELECT id, name FROM users').all();
    },

    getUser: function (id) {
        return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    },

    addUser: function (body) {
        let result;

        try {
            result = db.prepare(`
                INSERT INTO users (name, balance, bank_account, recurring_withdraw)
                VALUES (?, ?, ?, ?)
            `).run(body.name, body.balance, body.bank_account, body.recurring_withdraw);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    updateUser: function (body) {
        let result;

        try {
            result = db.prepare(`
                UPDATE users SET (name, balance, bank_account, recurring_withdraw) =
                (?, ?, ?, ?) WHERE id = ?
            `).run(body.name, body.balance, body.bank_account, body.recurring_withdraw, body.id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    withdrawUser: function (body) {
        let result;

        try {
            result = db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?')
                .run(body.amount, body.id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    deleteUser: function (id) {
        const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);

        return result;
    },

    /**
     * Bikes
     */
    getBikesPosCity: function (cityId) {
        return db.prepare('SELECT id, status_id, lat, lon FROM bikes WHERE city_id = ?')
            .all(cityId);
    },

    getBikesCity: function (cityId) {
        return db.prepare('SELECT * FROM bikes WHERE city_id = ?').all(cityId);
    },

    getBikesCityStatus: function (cityId, statusId) {
        return db.prepare('SELECT * FROM bikes WHERE city_id = ? AND status_id = ?')
            .all(cityId, statusId);
    },

    getBikesCityStation: function (cityId, stationId) {
        return db.prepare('SELECT * FROM bikes WHERE city_id = ? AND station_id = ?')
            .all(cityId, stationId);
    },

    getBikesCityParkZone: function (cityId, parkId) {
        return db.prepare('SELECT * FROM bikes WHERE city_id = ? AND park_id = ?')
            .all(cityId, parkId);
    },

    getBike: function (id) {
        return db.prepare('SELECT * FROM bikes WHERE id = ?').get(id);
    },

    getBikeUser: function (userId) {
        return db.prepare('SELECT * FROM bikes WHERE user_id = ?').get(userId);
    },

    addBike: function (body) {
        let result;

        result = db.prepare(`
            INSERT INTO bikes (city_id, user_id, status_id, station_id, park_id, lat, lon,
                speed, battery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(body.city_id, body.user_id, body.status_id, body.station_id, body.park_id,
            body.lat, body.lon, body.speed, body.battery);

        return result;
    },

    updateBike: function (body) {
        let result;

        try {
            result = db.prepare(`
                UPDATE bikes SET (city_id, user_id, status_id, station_id, park_id, lat, lon,
                    speed, battery) = (?, ?, ?, ?, ?, ?, ?, ?, ?) WHERE id = ?
            `).run(body.city_id, body.user_id, body.status_id, body.station_id, body.park_id,
                body.lat, body.lon, body.speed, body.battery, body.id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    updateBikeCheckParkZone: function (body) {
        let result = {
            changes: 1
        };

        try {
            const bike = db.prepare('SELECT city_id, park_id, lat, lon FROM bikes WHERE id = ?')
                .get(body.id);

            if (!bike) {
                throw new Error('id not found');
            }

            const newParkId = posInParkingZone(bike.city_id, bike.lat, bike.lon);

            if (bike.park_id !== newParkId) {
                result = db.prepare(`UPDATE bikes SET park_id = ${newParkId} WHERE id = ?`)
                    .run(body.id);

                // Remove bike from old park_zone
                if (bike.park_id) {
                    db.prepare(`UPDATE park_zones SET num_bikes = num_bikes - 1 WHERE id = ?`)
                        .run(bike.park_id);
                }

                // Add bike to new park_zone
                if (newParkId) {
                    db.prepare(`UPDATE park_zones SET num_bikes = num_bikes + 1 WHERE id = ?`)
                        .run(newParkId);
                }
            }

            result.park_id = newParkId;
        } catch (err) {
            result = {
                changes: 0,
                park_id: 0,
                message: err.message
            };
        }

        return result;
    },

    updateBikeStartCharge: function (body) {
        let result;

        try {
            const bike = db.prepare('SELECT status_id FROM bikes WHERE id = ?')
                .get(body.bike_id);

            if (!bike) {
                throw new Error('bike_id not found');
            }

            if (bike.status_id === 3) {
                throw new Error('Bike is already charging');
            }

            const stationResult = db.prepare(`UPDATE stations SET num_free = num_free - 1
                WHERE id = ?`).run(body.station_id);

            if (stationResult.changes === 0) {
                throw new Error('station_id not found');
            }

            result = db.prepare(`UPDATE bikes SET (status_id, station_id) = (3, ?) WHERE id = ?`)
                .run(body.station_id, body.bike_id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    updateBikeStopCharge: function (body) {
        let result;

        try {
            const bike = db.prepare('SELECT status_id, station_id FROM bikes WHERE id = ?')
                .get(body.bike_id);

            if (!bike) {
                throw new Error('bike_id not found');
            }

            if (bike.status_id !== 3) {
                throw new Error('Bike is not charging');
            }

            const stationResult = db.prepare(`UPDATE stations SET num_free = num_free + 1
                WHERE id = ?`).run(bike.station_id);

            if (stationResult.changes === 0) {
                throw new Error('station_id not found');
            }

            result = db.prepare(`UPDATE bikes SET (status_id, station_id) = (0, 0) WHERE id = ?`)
                .run(body.bike_id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    updateBikeUserStatusStationPark: function (body) {
        let result;

        try {
            result = db.prepare(`
                UPDATE bikes SET (user_id, status_id, station_id, park_id) =
                (?, ?, ?, ?) WHERE id = ?
            `).run(body.user_id, body.status_id, body.station_id, body.park_id, body.id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    updateBikePosSpeedBatt: function (body) {
        let result;

        try {
            result = db.prepare(`
                UPDATE bikes SET (lat, lon, speed, battery) =
                (?, ?, ?, ?) WHERE id = ?
            `).run(body.lat, body.lon, body.speed, body.battery, body.id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    deleteBike: function (id) {
        const result = db.prepare('DELETE FROM bikes WHERE id = ?').run(id);

        return result;
    },

    /**
     * Charging stations
     */
    getStationsCity: function (cityId) {
        return db.prepare('SELECT * FROM stations WHERE city_id = ?').all(cityId);
    },

    getStation: function (id) {
        return db.prepare('SELECT * FROM stations WHERE id = ?').get(id);
    },

    addStation: function (body) {
        let result;

        result = db.prepare(`
            INSERT INTO stations (city_id, num_free, num_total, lat, lon)
            VALUES (?, ?, ?, ?, ?)
        `).run(body.city_id, body.num_free, body.num_total, body.lat, body.lon);

        return result;
    },

    updateStation: function (body) {
        let result;

        try {
            result = db.prepare(`
                UPDATE stations SET (city_id, num_free, num_total, lat, lon) =
                (?, ?, ?, ?, ?) WHERE id = ?
            `).run(body.city_id, body.num_free, body.num_total, body.lat, body.lon, body.id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },
    /*
    addNumFreeStation: function (body) {
        let result;

        try {
            result = db.prepare(`UPDATE stations SET num_free = num_free + ? WHERE id = ?`)
                .run(body.num, body.id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            }
        }

        return result;
    },
    */
    deleteStation: function (id) {
        const result = db.prepare('DELETE FROM stations WHERE id = ?').run(id);

        return result;
    },

    /**
     * Parking zones
     */
    getParkZonesCity: function (cityId) {
        return db.prepare('SELECT * FROM park_zones WHERE city_id = ?').all(cityId);
    },

    getParkZone: function (id) {
        return db.prepare('SELECT * FROM park_zones WHERE id = ?').get(id);
    },

    addParkZone: function (body) {
        let result;

        result = db.prepare(`
            INSERT INTO park_zones (city_id, lat, lon, dlat, dlon)
            VALUES (?, ?, ?, ?, ?)
        `).run(body.city_id, body.lat, body.lon, body.dlat, body.dlon);

        return result;
    },

    updateParkZone: function (body) {
        let result;

        try {
            result = db.prepare(`
                UPDATE park_zones SET (city_id, lat, lon, dlat, dlon, num_bikes) =
                (?, ?, ?, ?, ?, ?) WHERE id = ?
            `).run(body.city_id, body.lat, body.lon, body.dlat, body.dlon, body.num_bikes,
                body.id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    deleteParkZone: function (id) {
        const result = db.prepare('DELETE FROM park_zones WHERE id = ?').run(id);

        return result;
    },

    /**
     * Pricing
     */
    getPricingCity: function (cityId) {
        return db.prepare('SELECT * FROM pricing WHERE city_id = ?').get(cityId);
    },

    addPricing: function (body) {
        let result;

        try {
            result = db.prepare(`
                INSERT INTO pricing (city_id, start_fee, minute_fee, extra_fee, discount)
                VALUES (?, ?, ?, ?, ?)
            `).run(body.city_id, body.start_fee, body.minute_fee, body.extra_fee, body.discount);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    updatePricing: function (body) {
        let result;

        try {
            result = db.prepare(`
                UPDATE pricing SET (start_fee, minute_fee, extra_fee, discount) =
                (?, ?, ?, ?) WHERE city_id = ?
            `).run(body.start_fee, body.minute_fee, body.extra_fee, body.discount, body.city_id);
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    deletePricing: function (cityId) {
        const result = db.prepare('DELETE FROM pricing WHERE city_id = ?').run(cityId);

        return result;
    },

    /**
     * Rides
     */
    getRidesUser: function (userId) {
        return db.prepare('SELECT * FROM rides WHERE user_id = ?').all(userId);
    },

    getRidesBike: function (bikeId) {
        return db.prepare('SELECT * FROM rides WHERE bike_id = ?').all(bikeId);
    },

    getRide: function (id) {
        return db.prepare('SELECT * FROM rides WHERE id = ?').get(id);
    },

    startRide: function (body) {
        let result;

        try {
            // Get bike
            const bike = db.prepare('SELECT status_id, park_id, lat, lon FROM bikes WHERE id = ?')
                .get(body.bike_id);

            if (!bike) {
                throw new Error('bike_id not found');
            }

            if (bike.status_id) {
                throw new Error('Bike is not available for lease');
            }

            // Create a new ride
            result = db.prepare(`
                INSERT INTO rides (start_time, start_lat, start_lon, start_park_id,
                    user_id, bike_id)
                VALUES (datetime('now', 'localtime'), ?, ?, ?, ?, ?)
            `).run(bike.lat, bike.lon, bike.park_id, body.user_id, body.bike_id);

            // Update user
            const userResult = db.prepare(`UPDATE users SET ride_id =
                ${result.lastInsertRowid} WHERE id = ?`).run(body.user_id);

            if (userResult.changes === 0) {
                // Delete inserted ride
                db.prepare(`DELETE FROM rides WHERE id = ${result.lastInsertRowid}`).run();

                throw new Error('user_id not found');
            }

            // Update bike
            db.prepare(`UPDATE bikes SET (user_id, status_id, park_id) =
                (?, 1, 0) WHERE id = ?`).run(body.user_id, body.bike_id);

            // Remove bike from park_zone
            if (bike.park_id) {
                db.prepare(`UPDATE park_zones SET num_bikes = num_bikes - 1 WHERE id = ?`)
                    .run(bike.park_id);
            }
        } catch (err) {
            result = {
                changes: 0,
                message: err.message
            };
        }

        return result;
    },

    finishRide: function (body) {
        let result;

        try {
            // Get ride_id
            const user = db.prepare('SELECT ride_id FROM users WHERE id = ?').get(body.user_id);

            if (!user) {
                throw new Error('user_id not found');
            }

            // Get ride
            const ride = db.prepare(`SELECT start_time, start_lat, start_lon, start_park_id,
                bike_id FROM rides WHERE id = ?`).get(user.ride_id);

            if (!ride) {
                throw new Error('No matching ride found for supplied user_id');
            }

            // Get bike
            const bike = db.prepare(`SELECT city_id, lat, lon FROM bikes WHERE id = ?`)
                .get(ride.bike_id);

            if (!bike) {
                throw new Error('bike_id for ride not found');
            }

            // Calculate price of trip
            const pricing = db.prepare(`SELECT * FROM pricing WHERE city_id = ?`)
                .get(bike.city_id);

            const duration = db.prepare(`SELECT unixepoch('now') - unixepoch(?, 'utc') AS sec`)
                .get(ride.start_time);

            let price = pricing.start_fee + pricing.minute_fee * duration.sec / 60;

            // const parkIdStart = posInParkingZone(bike.city_id, ride.start_lat, ride.start_lon);
            const parkIdStop  = posInParkingZone(bike.city_id, bike.lat, bike.lon);

            // Reduced price if start outside p-zone and finish in p-zone
            if (!ride.start_park_id && parkIdStop) {
                price -= pricing.discount;
            }

            // Extra fee if finish outside p-zone
            if (!parkIdStop) {
                price += pricing.extra_fee;
            }

            price = Number(price.toFixed(2));

            // Update tables
            result = db.prepare(`
                UPDATE rides SET (duration, stop_lat, stop_lon, price) =
                (?, ?, ?, ?) WHERE id = ?
            `).run((duration.sec / 60).toFixed(2), bike.lat, bike.lon, price, user.ride_id);

            db.prepare(`UPDATE users SET (balance, ride_id) = (balance - ${price}, 0)
                WHERE id = ?`).run(body.user_id);

            db.prepare(`UPDATE bikes SET (user_id, status_id, park_id) =
                (0, 0, ?) WHERE id = ?`).run(parkIdStop, ride.bike_id);

            // Add bike to park_zone
            if (parkIdStop) {
                db.prepare(`UPDATE park_zones SET num_bikes = num_bikes + 1 WHERE id = ?`)
                    .run(parkIdStop);
            }

            result.price = price;
        } catch (err) {
            result = {
                changes: 0,
                price: 0,
                message: err.message
            };
        }

        return result;
    },

    deleteRide: function (id) {
        const result = db.prepare('DELETE FROM rides WHERE id = ?').run(id);

        return result;
    },

};

module.exports = dbModel;




