# REST API Reference

Base URL (development): `http://localhost:8080`

All endpoints are served under the `/api` prefix. The frontend reaches them
through Vite's dev proxy (`/api` → `http://localhost:8080`). CORS is enabled for
`http://localhost:5173` and `http://localhost:3000`.

Responses are JSON. The `/api/ml/*` endpoints are **proxied** to the Python ML
service (see [ML service docs](../ml-service.md)).

## Conventions

- All query parameters are **optional** unless stated otherwise.
- The three filter parameters shared across endpoints are:
  - `year` — integer, e.g. `2021`
  - `district` — regional name (`DESC_REGIONAL`), matched case-insensitively
  - `type` — accident type (`DESC_TIPO_ACIDENTE`), matched case-insensitively
- Timestamps are ISO-8601 strings; `weekday` is `0=Monday … 6=Sunday`.

---

## Accidents

### `GET /api/accidents`

List accidents, optionally filtered. Only the **first** matching parameter (in the
order below) is applied.

| Parameter | Type | Description |
|-----------|------|-------------|
| `district` | string | Filter by regional |
| `neighborhood` | string | Filter by neighborhood |
| `type` | string | Filter by accident type |
| `year` | int | Filter by year (combine with `month`) |
| `month` | int | Filter by month (requires `year`) |

Returns an array of `Accident` objects (see [schema](#accident-object)).

```bash
curl "http://localhost:8080/api/accidents?year=2021&month=3"
```

### `GET /api/accidents/{id}`

Return a single accident by its numeric `id`. Responds `404 Not Found` if no
accident has that id.

```bash
curl "http://localhost:8080/api/accidents/42"
```

### `GET /api/map`

Return all accidents that have valid `latitude`/`longitude` coordinates, for the
interactive map. Returns an array of `Accident` objects.

```bash
curl "http://localhost:8080/api/map"
```

---

## Statistics

### `GET /api/statistics`

Return aggregated statistics over the (optionally filtered) dataset. This is the
endpoint that powers the dashboard charts and cards.

| Parameter | Type | Description |
|-----------|------|-------------|
| `year` | int | Restrict to a year |
| `district` | string | Restrict to a regional |
| `type` | string | Restrict to an accident type |

**Response shape**

```json
{
  "totalAccidents": 97498,
  "totalFatalities": 882,
  "byDistrict":       [ { "district": "CENTRO-SUL", "total": 12345 }, ... ],
  "topNeighborhoods": [ { "neighborhood": "CENTRO", "total": 3456 }, ... ],
  "byType":           [ { "type": "COLISÃO", "total": 23456 }, ... ],
  "byYear":           [ { "year": 2016, "total": 11111 }, ... ],
  "byHour":           [ { "hour": 18, "total": 6789 }, ... ],
  "byWeekday":        [ { "weekday": 4, "total": 15000 }, ... ]
}
```

Notes:

- `byDistrict`, `topNeighborhoods`, and `byType` are sorted by `total`
  descending; `topNeighborhoods` is capped at 15 entries.
- `byYear`, `byHour`, and `byWeekday` are sorted ascending by their key.
- `totalFatalities` is the sum of the `total_fatalities` column.

```bash
curl "http://localhost:8080/api/statistics?district=CENTRO-SUL"
```

---

## Machine Learning (proxied)

These endpoints are proxied by `MlController` to the Python ML service
(`ml.service.url`, default `http://localhost:8000`). If the ML service is
unreachable the backend responds `503 Service Unavailable` with
`{ "error": "ML service unavailable: …" }`.

All three accept the shared `year` / `district` / `type` filters.

### `GET /api/ml/forecast`

Monthly accident forecast (seasonal-naive). Extra parameter:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `periods` | int (1–12) | 3 | Number of future months to project (the frontend requests 6) |

```json
{
  "historical": [ { "year": 2016, "month": 1, "total": 980 }, ... ],
  "forecast":   [ { "year": 2024, "month": 1, "total": 1010, "lower": 920, "upper": 1100 }, ... ]
}
```

If there are fewer than 6 monthly points the response is
`{ "historical": [], "forecast": [], "message": "Dados insuficientes para previsão" }`.

### `GET /api/ml/severity`

Fatality-risk analysis from the Random Forest model.

```json
{
  "riskByHour":         [ { "hour": 0, "avgRisk": 0.0123 }, ... ],
  "featureImportances": [ { "feature": "Hora do dia", "importance": 0.398 }, ... ],
  "totalAccidents": 97498,
  "totalFatals": 882,
  "fatalPct": 0.9
}
```

### `GET /api/ml/heatmap`

Accident counts per weekday × hour, for the temporal heatmap.

```json
{
  "cells": [
    { "weekday": 0, "weekdayName": "Segunda", "hour": 8, "total": 540, "intensity": 0.87 }, ...
  ],
  "maxTotal": 620
}
```

---

## Accident object

Shape of each element returned by `/api/accidents`, `/api/accidents/{id}`, and
`/api/map` (see `frontend/src/types/accident.ts` and the
[data model](../DATA_MODEL.md) for column meanings).

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | Primary key |
| `boletim` | string \| null | Police-report id (unique) |
| `dateTime` | string \| null | ISO-8601 timestamp |
| `year`, `month`, `hour` | number \| null | Extracted temporal fields |
| `weekday` | number \| null | 0=Monday … 6=Sunday |
| `accidentType` | string \| null | `DESC_TIPO_ACIDENTE` |
| `district` | string \| null | Regional (`DESC_REGIONAL`) |
| `neighborhood` | string \| null | Neighborhood |
| `streetType`, `streetName` | string \| null | Roadway type/name |
| `weather` | string \| null | Weather description |
| `pavement` | string \| null | Pavement description |
| `isSignposted` | number \| null | 1 = signposted, 0 otherwise |
| `speedLimit` | number \| null | Posted speed limit |
| `isFatal` | number | 1 = fatal accident, 0 otherwise |
| `upsValue` | number \| null | UPS severity value |
| `upsDescription` | string \| null | UPS severity label |
| `totalPeople` | number | People involved |
| `totalFatalities` | number | Fatalities in the accident |
| `totalVehicles` | number | Vehicles involved |
| `latitude`, `longitude` | number \| null | WGS84 coordinates |
