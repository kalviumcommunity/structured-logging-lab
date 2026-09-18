# Cloud Logging Mapping

This document explains how the structured JSON logs emitted by `orders-api` translate into queryable fields in modern cloud logging and observability systems like **Google Cloud Logging (Cloud Operations Suite)** and **Grafana Loki**.

---

## 1. Emitted Log Structure

Every log event from `orders-api` emits a single-line JSON object to `stdout`:

```json
{
  "service": "orders-api",
  "level": "info",
  "ts": "2026-09-18T10:45:00.000Z",
  "reqId": "e1f7a29e-64c8-47c1-84ba-1cf4b6cebca0",
  "msg": "Order created successfully",
  "orderId": 42
}
```

---

## 2. Google Cloud Logging (GCP) Mapping

When deployed to Google Kubernetes Engine (GKE), Cloud Run, or Compute Engine, the Cloud Logging agent automatically parses `stdout` JSON into the `jsonPayload` field.

| App JSON Field | GCP Cloud Logging Field / Mapping | Description |
| :--- | :--- | :--- |
| `ts` | `timestamp` | ISO timestamp is automatically recognized and sets the log entry timestamp. |
| `level` | `severity` | Maps directly to `DEFAULT`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`. |
| `service` | `resource.labels.service_name` or `jsonPayload.service` | Used to filter logs to a specific microservice. |
| `reqId` | `jsonPayload.reqId` / `trace` | Enables correlation across microservice boundaries. |
| `msg` | `jsonPayload.msg` or `textPayload` | Searchable message body. |
| `orderId` / context | `jsonPayload.orderId` | Indexed as structured payload attributes. |

### Example GCP Log Explorer Query
```sql
resource.type="k8s_container"
jsonPayload.service="orders-api"
severity >= WARNING
jsonPayload.reqId="e1f7a29e-64c8-47c1-84ba-1cf4b6cebca0"
```

---

## 3. Grafana Loki Mapping

When scraped by Promtail or Grafana Agent with JSON stage parsing (`stage.json`), fields are extracted into Loki labels or structured metadata.

| App JSON Field | Loki Label / Parsed Key | Description |
| :--- | :--- | :--- |
| `service` | Stream Label (`service="orders-api"`) | High-cardinality-safe indexing stream. |
| `level` | Stream Label / Extracted (`level="error"`) | Used to filter log volume by severity. |
| `reqId` | Structured Metadata / Line Filter | Extracted for fast trace lookups via LogQL. |
| `ts` | Record timestamp | Time ordering in panels and dashboards. |

### Example LogQL Queries
- **Find all errors**:
  ```logql
  {service="orders-api"} | json | level = "error"
  ```
- **Trace a single request flow**:
  ```logql
  {service="orders-api"} | json | reqId = "e1f7a29e-64c8-47c1-84ba-1cf4b6cebca0"
  ```

---

## 4. Key Benefits of this Setup
1. **Zero Text Parsing Overhead**: No complex regex required in log shippers.
2. **Instant Troubleshooting**: Incidents can be pinpointed using exact request IDs.
3. **Automated Alerting**: Cloud metrics can count occurrences of `severity=ERROR` or `level="error"` in real-time.
