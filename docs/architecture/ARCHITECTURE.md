# System Architecture

This document gives a high-level overview of how the *Traffic Accident Analysis
in Belo Horizonte* system is structured and how data flows through it. For the
reasoning behind each decision, see the
[Architecture Decision Records](./decisions/README.md).

## Overview

The system is a **three-layer, decoupled web application** built on top of the
open accident dataset published by BHTrans (Belo Horizonte, 2016–2023). Each
layer is independent and communicates over HTTP/JSON.

```
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND  —  React + TypeScript (Vite)                        │
│  Dashboard, interactive map (Leaflet), charts (Recharts),     │
│  dynamic filters, rule-based chart insights                   │
└───────────────────────────────┬──────────────────────────────┘
                                 │  HTTP / JSON  (proxied at /api)
                                 ▼
┌──────────────────────────────────────────────────────────────┐
│  BACKEND  —  Kotlin + Spring Boot (MVC, REST)                 │
│  /api/accidents, /api/statistics, /api/map                    │
│  /api/ml/*  ── proxy ──►  ML service                          │
└───────────────┬───────────────────────────┬──────────────────┘
                │ Spring Data JPA            │ RestTemplate (HTTP)
                ▼                            ▼
┌───────────────────────────┐   ┌──────────────────────────────┐
│  DATA                      │   │  ML SERVICE — Python/FastAPI  │
│  SQLite (accidents.db)     │◄──┤  scikit-learn, statsmodels    │
│  ~97k accidents, indexed   │   │  /forecast /severity /heatmap │
└───────────────────────────┘   └──────────────────────────────┘
        ▲
        │ generated once by
        │ scripts/migrate_data.py  (CSV → SQLite, UTM → WGS84)
        │
┌───────────────────────────┐
│  dataset_consolidado.csv   │  (output of phase 1 data cleaning)
└───────────────────────────┘
```

## Layers

### Frontend — `frontend/`

A single-page React application written in TypeScript and bundled with Vite.

- **`App.tsx`** orchestrates the dashboard: it loads base statistics and the ML
  views on mount, and re-fetches everything whenever the filters change.
- **`components/`** holds the presentational pieces: `StatisticsCard`, the charts
  (`AccidentsByYearChart`, `AccidentsByHourChart`, `AccidentsByWeekdayChart`,
  `AccidentsByTypeChart`, `TopNeighborhoodsChart`), the `AccidentsMap` (Leaflet),
  the predictive views (`ForecastChart`, `SeverityChart`, `HeatmapChart`), the
  `FilterPanel`, and `ChartInsight` (rule-based interpretation text).
- **`services/api.ts`** is the single Axios client; all calls go to `/api`, which
  Vite proxies to the backend in development.
- **`types/`** mirrors the backend response shapes (`accident.ts`,
  `statistics.ts`, `ml.ts`).

The browser only ever talks to `/api`; it does not know that machine learning is
served by a separate process.

### Backend — `backend/`

A Spring Boot 3.2 service in Kotlin (Java 17), organised in MVC layers:

- **`controller/`** — `AccidentController` (`/api/accidents`, `/api/statistics`,
  `/api/map`) and `MlController` (`/api/ml/*` proxy).
- **`service/`** — `AccidentService` holds the aggregation logic for statistics.
- **`repository/`** — `AccidentRepository` (Spring Data JPA) with derived queries
  and `@Query` aggregations.
- **`model/`** — the `Accident` JPA entity.
- **`config/`** — `WebConfig` configures CORS for the dev frontend origins.

See [ADR-0002](./decisions/2026-03-31-kotlin-spring-boot-backend.md) and
[ADR-0005](./decisions/2026-04-08-server-side-aggregation.md).

### Data — SQLite

A single file, `backend/data/accidents.db`, holding one `accidents` table of
~97k rows with indexes on the most-queried columns. It is **read-only at runtime**
and is regenerated deterministically by the migration script. The Python ML
service reads the very same file. See
[ADR-0003](./decisions/2026-03-31-sqlite-database.md) and the
[data model](../DATA_MODEL.md).

### ML service — `ml-service/`

A FastAPI application that reads the SQLite database, trains a Random Forest
severity model at startup, and serves `/forecast`, `/severity`, and `/heatmap`.
The backend proxies it under `/api/ml/*`. See
[ADR-0008](./decisions/2026-05-21-python-ml-microservice.md),
[ADR-0009](./decisions/2026-05-25-seasonal-naive-forecasting.md), and the
[ML service docs](../ml-service.md).

## Request flow

### Statistics (with filters)

1. The user changes a filter in `FilterPanel`.
2. `App.tsx` calls `api.getStatistics(filters)` → `GET /api/statistics?year=…&district=…&type=…`.
3. `AccidentController.statistics()` delegates to `AccidentService.getStatistics()`.
4. The service runs indexed `GROUP BY` queries (unfiltered path) or filters and
   aggregates in memory (filtered path) and returns a single JSON summary.
5. The charts re-render from that summary.

### Predictive views

1. `App.tsx` calls `api.getForecast/getSeverity/getHeatmap(filters)` →
   `GET /api/ml/*`.
2. `MlController` proxies the request to the Python service
   (`ml.service.url`, default `http://localhost:8000`).
3. The ML service queries SQLite, computes the result, and returns JSON.
4. If the ML service is unreachable, the backend returns HTTP 503 and the
   frontend shows a non-blocking warning while the rest of the dashboard keeps
   working.

### Map

`AccidentsMap` calls `GET /api/map`, which returns accidents that have valid
coordinates; the component plots up to 3,000 points with Leaflet over
OpenStreetMap tiles, colouring fatal accidents differently.

## Local topology (development)

| Service     | Command                                  | Port |
|-------------|------------------------------------------|------|
| Frontend    | `npm run dev` (Vite)                      | 5173 |
| Backend     | `mvn spring-boot:run`                     | 8080 |
| ML service  | `uvicorn main:app --reload`              | 8000 |

The frontend proxies `/api` → `8080`; the backend proxies `/api/ml` → `8000`.

## Cross-cutting concerns

- **CORS** — configured in `WebConfig` (and per-controller `@CrossOrigin`) for the
  `5173`/`3000` dev origins.
- **Configuration** — `application.yml` (backend) and the `DB_PATH` environment
  variable (ML service) point at the SQLite file; `ml.service.url` points the
  backend at the ML service.
- **Testing & CI** — per-layer tests run on every pull request; see
  [ADR-0007](./decisions/2026-05-21-testing-and-ci-strategy.md).
