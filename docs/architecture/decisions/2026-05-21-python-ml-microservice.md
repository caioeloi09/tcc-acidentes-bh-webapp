# ADR-0008: Separate Python ML microservice proxied by the backend

**Date:** 2026-05-21

## Status

Accepted

## Stakeholders

- Caio Eloi Campos (Developer)
- Prof. João Guilherme Maia de Menezes (Advisor)

## Context and Problem Description

The second iteration of the project adds **predictive analytics**: an accident
forecast, a severity (fatality-risk) analysis, and a temporal heatmap. These
features rely on the Python data-science ecosystem (`scikit-learn`,
`statsmodels`, `pandas`, `numpy`), which is not available on the JVM backend.

The decision is **how to integrate machine learning** into a system whose backend
is Kotlin/Spring Boot.

## Decision Criteria

- Access to mature ML libraries
- Clean separation between serving and modelling concerns
- Stable, single API surface for the frontend
- Independent evolution and deployment of the ML code
- Acceptable operational complexity for an academic project

## Options Considered

1. **Separate Python (FastAPI) microservice**, proxied by the Spring backend
2. **Implement ML on the JVM** (e.g. Smile, DL4J, Tribuo)
3. **Frontend calls the Python service directly**

## Decision Outcome

Chosen option: **a standalone Python ML microservice built with FastAPI**, which
the Spring Boot backend exposes to the frontend through a thin proxy.

- The ML service (`ml-service/main.py`) reads the same SQLite database, trains a
  `RandomForestClassifier` for severity at startup, and exposes
  `GET /forecast`, `GET /severity`, and `GET /heatmap` (plus `/health`), all
  accepting `year`/`district`/`type` filters.
- The backend's `MlController` proxies `/api/ml/forecast`, `/api/ml/severity`, and
  `/api/ml/heatmap` to the Python service (`ml.service.url`, default
  `http://localhost:8000`) via `RestTemplate`, returning HTTP 503 with a clear
  message when the service is unavailable.
- The frontend only ever talks to `/api/...`; it is unaware that ML is a separate
  process.

### Justification

Keeping ML in Python gives direct access to `scikit-learn`/`statsmodels`, which
have no equivalent on the JVM. Running it as a separate service cleanly isolates
the modelling code and lets it evolve independently. Proxying it through the
backend preserves a **single API origin and CORS surface** for the browser and
provides graceful degradation: if the ML process is down, the core dashboard
still works and the predictive section shows a friendly warning (handled in
`App.tsx`). Letting the frontend call Python directly was rejected because it
would fragment the API surface and complicate CORS and configuration.

### Positive Consequences

- Full access to the Python ML ecosystem.
- Modelling concerns are isolated from request-serving concerns.
- One API origin for the frontend; ML is an implementation detail.
- Graceful degradation when the ML service is offline.
- The ML service can be deployed/scaled separately.

### Negative Consequences

- A third process to run in development (`uvicorn main:app`) and operate.
- An extra network hop (browser → backend → ML service).
- Two languages and runtimes to maintain.
- The model is retrained in-memory at service startup rather than persisted.

## Pros and Cons of the Options

### Separate Python microservice (proxied)

**Pros:** best ML libraries, clean isolation, single frontend API, graceful fallback.
**Cons:** extra process and network hop; polyglot maintenance.

### ML on the JVM

**Pros:** one runtime; no extra service.
**Cons:** weaker/less familiar ML libraries; reimplementing what scikit-learn already provides.

### Frontend calls Python directly

**Pros:** removes the proxy hop.
**Cons:** fragmented API surface; CORS and configuration spread across services.

## Links

- `ml-service/main.py`
- `backend/.../controller/MlController.kt`
- [ML service documentation](../../ml-service.md)
- [ADR-0009 — Seasonal-naive baseline for accident forecasting](./2026-05-25-seasonal-naive-forecasting.md)
