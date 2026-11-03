# Cloud Logging Integration Guide

## 1. Overview
When applications run in containerized environments (Docker, Kubernetes, AWS ECS, GCP Cloud Run), container runtimes redirect `stdout` and `stderr` streams to standard container log drivers (such as `json-file`, `fluentd`, or systemd journal).

By emitting single-line structured JSON records directly to standard output, the log ingestion agent (e.g., Google Cloud Ops Agent, Fluent Bit, Promtail, AWS CloudWatch Agent, Datadog Agent) automatically parses the JSON stream into structured attributes without requiring brittle regular expression parsers.

---

## 2. Log Field Schema Mapping

| Application Field | Description | Google Cloud Logging | Grafana Loki | AWS CloudWatch Logs |
| :--- | :--- | :--- | :--- | :--- |
| `ts` | ISO 8601 UTC timestamp (`2026-11-03T04:30:00.000Z`) | `timestamp` (event timestamp) | Ingestion timestamp / parsed entry timestamp | `@timestamp` |
| `level` | Severity level (`info`, `warn`, `error`, `debug`) | `severity` (`INFO`, `WARNING`, `ERROR`, `DEBUG`) | Stream label `{level="..."}` or extracted field | Extracted `level` field |
| `service` | Service name (`orders-api`) | `resource.labels.service_name` or `jsonPayload.service` | Stream label `{service="orders-api"}` | Extracted `service` field / Log Group |
| `reqId` | Correlation / Request ID (`UUIDv4`) | `jsonPayload.reqId` or `logging.googleapis.com/trace` | Structured metadata / extracted field `reqId` | `reqId` |
| `msg` | Human-readable event description | `jsonPayload.msg` or `textPayload` | Parsed field `msg` / log line | `msg` |
| `err` | Error metadata (name, message, stack) | `jsonPayload.err` (searchable nested JSON) | Parsed JSON object `err` | `err.message`, `err.stack` |
| Additional Context (`orderId`, `durationMs`, etc.) | Domain-specific context | `jsonPayload.<field>` | Extracted field `<field>` | Extracted field `@field` |

---

## 3. Querying in Cloud Observability Platforms

### A. Google Cloud Logging (Logs Explorer)
Google Cloud Logging natively maps JSON fields into `jsonPayload`.

- **Filter all errors across the service:**
  ```text
  resource.type="k8s_container"
  jsonPayload.service="orders-api"
  severity>=ERROR
  ```

- **Trace a single request's full journey end-to-end:**
  ```text
  jsonPayload.service="orders-api"
  jsonPayload.reqId="c9bf9e57-1685-4c89-bafb-ff5af830be8a"
  ```

- **Filter slow requests exceeding 500ms:**
  ```text
  jsonPayload.service="orders-api"
  jsonPayload.durationMs > 500
  ```

---

### B. Grafana Loki (LogQL)
Loki parses the JSON payload at query time using the `| json` parser.

- **Filter all errors across the service:**
  ```logql
  {service="orders-api"} | json | level = "error"
  ```

- **Trace a single failing request end-to-end by correlation ID:**
  ```logql
  {service="orders-api"} | json | reqId = "c9bf9e57-1685-4c89-bafb-ff5af830be8a"
  ```

- **Calculate 5-minute error rate:**
  ```logql
  sum(rate({service="orders-api"} | json | level = "error" [5m]))
  ```

---

### C. AWS CloudWatch Logs Insights
CloudWatch automatically parses JSON log events into discoverable `@` or root fields.

- **Filter errors and extract key diagnostics:**
  ```sql
  fields @timestamp, reqId, msg, err.message, err.name
  | filter service = 'orders-api' and level = 'error'
  | sort @timestamp desc
  | limit 50
  ```

- **Trace full lifecycle of a specific request:**
  ```sql
  fields @timestamp, level, msg, path, statusCode, durationMs
  | filter reqId = 'c9bf9e57-1685-4c89-bafb-ff5af830be8a'
  | sort @timestamp asc
  ```

---

## 4. Operational Benefits for Production Teams

1. **Sub-Second Incident Triage**: Instead of scrolling through walls of unstructured plain text, on-call engineers filter by `level="error"` to identify the root incident, extract the `reqId`, and instantly reconstruct the entire causal timeline of that single user's transaction.
2. **Deterministic Alerting**: Cloud alerting rules trigger on explicit criteria (e.g., `jsonPayload.statusCode >= 500` or `level == "error"`) without relying on brittle regex pattern matches that break when someone changes wording.
3. **Distributed Tracing & Correlation**: By propagating `X-Request-Id` across microservice boundaries (Orders API → Payment Gateway → Inventory API), the same `reqId` appears across every downstream service's logs, enabling holistic distributed transaction tracing.
4. **Security & Compliance**: Built-in field sanitization guarantees that sensitive credentials (passwords, tokens, card details) never leave the application boundary, complying with PCI-DSS and GDPR logging standards.
