# structured-logging-lab

This repository contains a simple Orders API application for the DevOps Foundation assignment: Implementing Structured Logging for Debugging (LU 5.3).

## Setup

```bash
docker compose up -d
```

## View Logs

```bash
docker logs orders-api
```

Every application log line is JSON with `ts`, `level`, `service`, `msg`, and
event context. Filter the stream with `jq`:

```bash
# all errors
docker logs orders-api | jq 'select(.level == "error")'

# the complete story for one request
docker logs orders-api | jq 'select(.reqId == "<request-id>")'
```

## Trigger Error

```bash
curl localhost:3000/simulate-error
```

The error log includes the request ID. Use it in the second query to trace that
failure without unrelated requests.
