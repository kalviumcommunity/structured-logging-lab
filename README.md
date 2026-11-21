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

## Trigger Error

```bash
curl localhost:3000/simulate-error
```

## Trace a Failure

The service writes one JSON object per line. Filter the container output by
severity, then use the request ID from the error record to follow the complete
request:

```bash
docker logs orders-api | jq 'select(.level=="error")'
docker logs orders-api | jq 'select(.reqId=="<the-failing-req-id>")'
```

See `CLOUD_LOGGING.md` for cloud field mappings and structured logging notes.
