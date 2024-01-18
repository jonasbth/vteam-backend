/**
 * The bike rental backend server app.
 * © Jonas B., Vteam 2023 Group 8.
 */
"use strict";

const port = 1337;
const express = require('express');
const cors = require('cors');
const routeAPI = require('./routes/api.js');
const db = require("./models/db_model.js");
const process = require('node:process');

const app = express();

app.use(cors());
app.options('*', cors());
//app.set("json spaces", 2);

function shutDown(code) {
    console.log(`\nReceived ${code}.`);
    console.log("Closing HTTP server.");

    server.close(() => {
        console.log("Closing database connection.");
        db.closeDB();
    });
}

process.on('exit', (code) => {
    console.log(`Exiting with code: ${code}`);
});

process.on('SIGINT', (code) => {
    shutDown(code);
});

process.on('SIGTERM', (code) => {
    shutDown(code);
});

process.on('SIGHUP', (code) => {
    shutDown(code);
});

app.use(express.static("public"));

app.use("/api/v1", routeAPI);

const server = app.listen(port, () => {
    console.log(`Bike server listening on port ${port}`);
});

// export is used when testing
module.exports = server;

