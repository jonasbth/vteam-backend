# Backend server and database
## Starting the server
* Open a terminal and move to the root of backend/ directory
* `docker compose up` or
* `docker compose up -d` to run in the background (doesn't show console logs)

## Stopping the server
* `docker compose down` (run in new terminal, if not starting server in the background)

## Rebuilding
* `docker compose build` (if source code or Dockerfile was changed)

## API endpoints
* Documentation is available at localhost:1337 or localhost:1337/api/v1/

## Notes
* the db/ directory is mounted, so that database changes are preserved between container restarts.
* A few API endpoints perform special actions and may involve several database updates, notably:
  * `PUT /users/withdraw`
  * `PUT /bikes/check_park_zone`
  * `PUT /bikes/start_charge`
  * `PUT /bikes/stop_charge`
  * `POST /rides` (start a ride)
  * `PUT /rides` (finish a ride)

