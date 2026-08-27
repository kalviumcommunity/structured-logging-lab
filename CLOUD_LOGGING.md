# Cloud logging mapping

The service writes one JSON object per line to standard output. A cloud log
collector can parse those objects so `ts`, `level`, `service`, `reqId`, `msg`,
and the event context become searchable fields.

## Google Cloud Logging

When stdout is collected by Google Cloud's logging agent, JSON output is
ingested as structured payload data. In production, `level` can drive alerting
and `service` or `reqId` can scope an investigation. The equivalent of the
local error query is a Logs Explorer filter such as:

```text
jsonPayload.level="error"
resource.labels.service_name="orders-api"
```

To follow one request, add `jsonPayload.reqId="<request-id>"`. The application
does not deploy or configure a cloud service; it only emits the same structured
records that a collector can index.

## Grafana Loki

Promtail or the Grafana Alloy collector can parse the JSON lines and expose
their fields to LogQL. A local error query maps to:

```text
{service="orders-api"} | json | level="error"
```

Request tracing can add `| reqId="<request-id>"`. The request ID remains useful
across services when each service includes it in its own JSON logs.