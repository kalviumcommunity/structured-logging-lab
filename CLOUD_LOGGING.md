# Cloud Logging Mapping

This application uses structured JSON logs with consistent fields such as:

- `ts` - timestamp of the log event
- `level` - severity level such as `info`, `warn`, or `error`
- `service` - name of the service
- `msg` - description of the event
- `reqId` - unique request/correlation ID

For example:

```json
{
  "ts": "2026-09-06T15:12:12.421Z",
  "level": "error",
  "service": "orders-api",
  "msg": "Simulated error occurred",
  "reqId": "1b27fcf6-eeee-448b-ace9-20cc78c9ded2"
}