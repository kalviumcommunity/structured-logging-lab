# structured-logging-lab

This repository contains a simple Orders API application upgraded with production-grade structured JSON logging, strict severity levels, request correlation IDs, and queryable diagnostics.

## Setup

```bash
docker compose up -d --build
```

## View Structured Logs

```bash
docker logs orders-api
```

Every line emits uniform, single-line JSON:
```json
{
  "ts": "2026-11-03T04:56:31.632Z",
  "level": "info",
  "service": "orders-api",
  "reqId": "cd0beefc-dacc-451f-b0f8-481ddc133463",
  "orderId": 8841,
  "msg": "payment.start"
}
```

## Available Endpoints

- `GET /` — Health check
- `GET /orders` — Fetch all orders from PostgreSQL
- `POST /orders` — Create a new order (validates `product_id`, `quantity`, `customer_id`)
- `POST /payments` — Process payment (with `orderId`)
- `GET /simulate-error` — Simulate a downstream payment gateway timeout

## Trigger Error & Trace with `jq`

1. **Trigger a failure:**
   ```bash
   curl -i http://localhost:3000/simulate-error
   ```

2. **Filter all errors across the service:**
   ```bash
   docker logs orders-api | jq 'select(.level=="error")'
   ```

3. **Trace the exact request lifecycle by its `reqId`:**
   ```bash
   docker logs orders-api | jq 'select(.reqId=="<the-failing-req-id>")'
   ```

## Cloud Integration
See [`CLOUD_LOGGING.md`](./CLOUD_LOGGING.md) for how these JSON fields seamlessly map into Google Cloud Logging, Grafana Loki, and AWS CloudWatch Logs.
