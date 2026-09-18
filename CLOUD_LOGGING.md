# Mapping these logs to a cloud log service

Each log line here is a single JSON object with `ts`, `level`, `msg`, `service`, and (on request-scoped lines) `reqId`. That shape is exactly what cloud log platforms want, so nothing extra has to change to make them searchable.

Google Cloud Logging: when a container writes JSON to stdout, Cloud Logging parses it automatically and puts every key under `jsonPayload`. If a `severity` field is present it gets promoted to the entry's own severity level, so mapping our `level` field to `severity` (info -> INFO, warn -> WARNING, error -> ERROR) makes the log viewer's severity filter work out of the box. From there you can filter with something like `jsonPayload.reqId="<id>"` or `severity=ERROR` in the Logs Explorer query bar, same idea as the jq filters used locally.

Grafana Loki: Loki treats the whole line as a label-less blob unless you tell it otherwise. With the `json` parser stage in a LogQL query (`{service="orders-api"} | json | level="error"`), every top-level key in our JSON (level, reqId, msg, etc.) becomes queryable as if it were a field. You'd usually also promote `service` to an actual stream label at ingestion (via Promtail/Alloy config) so Loki can shard by it efficiently, and leave the rest (`reqId`, `msg`, `level`) as parsed fields queried per request.

Either way the win is the same: no log-scraping regex needed on the cloud side, because the fields already exist in the log line. This is documentation only, nothing here was deployed.
