# Cloud Logging Mapping

The service now emits one JSON object per log line with consistent fields:

- `ts`: ISO timestamp
- `level`: severity such as `debug`, `info`, `warn`, or `error`
- `service`: `orders-api`
- `msg`: stable event name
- `reqId`: correlation ID for request-scoped events

Locally, these logs can be queried with `docker logs orders-api | jq ...`. In a cloud log service, the same JSON fields become searchable attributes:

- Google Cloud Logging can parse JSON logs into structured fields, so filters can target `jsonPayload.level="error"` or `jsonPayload.reqId="..."`.
- Grafana Loki can index labels such as service and level, then filter JSON fields with LogQL.
- AWS CloudWatch Logs Insights can query JSON fields such as `level`, `msg`, and `reqId`.

The debugging pattern is the same everywhere: filter to `level=error` to find failures, then filter to the failing `reqId` to read one request's complete story. Secrets, passwords, tokens, and card data should never be logged; use request IDs and safe identifiers instead.
