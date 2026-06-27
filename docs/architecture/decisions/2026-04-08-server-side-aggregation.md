# ADR-0005: Server-side aggregation for statistics

**Date:** 2026-04-08

## Status

Accepted

## Stakeholders

- Caio Eloi Campos (Developer)
- Prof. João Guilherme Maia de Menezes (Advisor)

## Context and Problem Description

The dashboard renders several aggregated views over the accident dataset:
accidents by year, by hour, by weekday, by type, the top neighbourhoods, the
distribution by district, and the total/fatal counts. These views must also react
to the interactive filters (year, district, type).

The decision is **where to compute these aggregations**: send the raw ~97k rows
to the browser and aggregate there, or aggregate on the backend and send only the
summarised results.

## Decision Criteria

- Payload size sent to the browser
- Client-side rendering performance
- Reuse of aggregation logic across clients (web UI, ML service, future clients)
- Simplicity of the frontend
- Consistency of filtered and unfiltered results

## Options Considered

1. **Aggregate on the backend**, expose a single `/api/statistics` endpoint
2. **Send raw rows** to the frontend and aggregate in JavaScript
3. **Pre-compute** all aggregations as static files at migration time

## Decision Outcome

Chosen option: **aggregate on the backend** and expose them through
`GET /api/statistics`, which accepts optional `year`, `district`, and `type`
filters.

`AccidentService.getStatistics()` returns a single response object containing
`totalAccidents`, `totalFatalities`, and the `byDistrict`, `topNeighborhoods`,
`byType`, `byYear`, `byHour`, and `byWeekday` breakdowns. When no filter is
applied it uses indexed `GROUP BY` repository queries (`countByDistrict`,
`countByYear`, …); when filters are present it loads the filtered subset and
aggregates in memory. The frontend's `FilterPanel` simply re-requests
`/api/statistics` with the active filters and re-renders.

### Justification

Sending one compact JSON summary instead of ~97k rows dramatically reduces
payload size and keeps the browser responsive. Centralising the aggregation logic
on the backend means there is a single source of truth that is also covered by
unit tests (`AccidentServiceTest`), and the same endpoint shape can be reused by
any client. Pre-computing static files was rejected because the interactive
filters generate a large combinatorial space of possible aggregations.

### Positive Consequences

- Small, predictable JSON payloads for every chart.
- A single, tested aggregation implementation (`AccidentService`).
- Filters are honoured server-side, keeping all charts mutually consistent.
- The frontend components stay declarative and thin.

### Negative Consequences

- Filtered aggregations load the matching rows into memory before grouping; fine
  at this scale but not for very large datasets.
- Each filter change is a round-trip to the backend.
- Aggregation logic lives in application code rather than purely in SQL, so some
  grouping is done in Kotlin instead of the database.

## Pros and Cons of the Options

### Backend aggregation

**Pros:** tiny payloads, reusable + tested logic, consistent filtering.
**Cons:** in-memory grouping on the filtered path; a request per filter change.

### Frontend aggregation of raw rows

**Pros:** filtering is instant once data is loaded; backend stays minimal.
**Cons:** large initial payload; heavy client CPU/memory; logic duplicated per client.

### Pre-computed static aggregations

**Pros:** fastest possible reads; no computation at request time.
**Cons:** cannot cover the arbitrary filter combinations the UI allows.

## Links

- [ADR-0003 — SQLite as the read-only analytical database](./2026-03-31-sqlite-database.md)
- [REST API reference](../../api/README.md)
