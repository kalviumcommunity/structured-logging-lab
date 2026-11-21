# Cloud Logging Mapping

The Orders API writes one JSON object per line to standard output. Docker captures
that output, so the same records can be collected by a cloud logging agent without
changing the application.

## Google Cloud Logging

Cloud Logging parses JSON emitted to stdout as structured log entries. The fields
map directly as follows:

- `ts`: event timestamp (or the collector timestamp if the platform overrides it)
- `level`: severity, mapped to `INFO`, `WARNING`, or `ERROR`
- `service`: service label, `orders-api`
- `msg`: searchable event name such as `payment.failed`
- `reqId`: request correlation field used to follow one request end to end
- Other fields such as `method`, `path`, `statusCode`, and `durationMs`: searchable
  structured metadata

Example queries include filtering `jsonPayload.level="ERROR"` and
`jsonPayload.reqId="<request-id>"`. In production, a platform-specific log router
or agent should be configured to collect the container's stdout and preserve these
JSON fields.

## Grafana Loki

Promtail or the Grafana Alloy Docker discovery integration can read the same stdout
lines and parse them with a JSON pipeline stage. Keep low-cardinality values such as
`service` and `level` as labels. Keep `reqId`, `msg`, and error details as parsed
fields rather than labels to avoid excessive label cardinality. A LogQL query can
then filter `{service="orders-api"} | json | level="error"` and narrow the result
with `reqId="<request-id>"`.

The application does not send secrets, passwords, tokens, card numbers, or request
bodies to the log stream.
