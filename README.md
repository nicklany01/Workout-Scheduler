Workout Scheduler - A simple app to log workouts and track progress.

Current features:
    Creation of future logs
    Update current day logs
    Add Exercises
    Track Exercises progress

Planned features:
    Track weight data
    Use database
    Add Google sign in
    Configuration and settings page
    Add strength standards to progression chart

To serve built static html page locally, use:
powershell -ExecutionPolicy Bypass -Command "serve -s dist"

Webhook handling docker container setup:
docker run -d \
  --network tunnel \
  -v /mnt/server/webhook:/hmnt/webhook \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/.docker:/root/.docker \
  -w /hmnt/webhook \
  --restart always \
  --name penguin-webhook-handler \
  node:21-alpine sh -c "apk add --no-cache bash docker-compose && npm install express body-parser && node index.js"
