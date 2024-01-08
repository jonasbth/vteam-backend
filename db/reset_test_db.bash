#!/usr/bin/env bash
#
# A script for resetting the database bike-rentals-test.sqlite
#

# Clear db file
> bike-rentals-test.sqlite

# Read commands from create-tables.sql
sqlite3 bike-rentals-test.sqlite < create-tables.sql

