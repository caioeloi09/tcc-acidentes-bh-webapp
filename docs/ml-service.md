# ML Service

A standalone **FastAPI** microservice that adds predictive and statistical
analytics on top of the accident database. The Spring Boot backend proxies it
under `/api/ml/*`; the browser never calls it directly. See
[ADR-0008](./architecture/decisions/2026-05-21-python-ml-microservice.md) and
[ADR-0009](./architecture/decisions/2026-05-25-seasonal-naive-forecasting.md).

- Source: `ml-service/main.py`
- Default port: `8000`
- Data source: the SQLite database at `DB_PATH`
  (default `../backend/data/accidents.db`)

## Running

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload          # http://localhost:8000
```

Dependencies (`requirements.txt`): `fastapi`, `uvicorn`, `pandas`,
`scikit-learn`, `statsmodels`, `numpy`.

CORS is enabled for `http://localhost:5173` and `http://localhost:8080`.

## Lifecycle

On startup (FastAPI `lifespan`) the service:

1. Loads the whole `accidents` table into a pandas DataFrame.
2. Trains a `RandomForestClassifier` (severity model) once and keeps it, together
   with the DataFrame and the feature importances, in application state.

All endpoints share an optional filter set — `year`, `district`, `type` — applied
in-memory before computing the result.

## Endpoints

### `GET /health`

Liveness probe. Returns `{ "status": "ok", "rows": <loaded row count> }`.

### `GET /forecast`

Seasonal-naive monthly forecast of accident counts.

- **Method:** for each future month, the prediction is the mean of historical
  totals for that same calendar month; the band is ± one standard deviation of
  those same-month values (±10% when only one observation exists).
- **Params:** `year`, `district`, `type`, and `periods` (1–12, default 3).
- **Returns:** `historical[]` and `forecast[]` points
  (`year`, `month`, `total`, plus `lower`/`upper` on forecast points).
- Needs ≥ 6 monthly points, otherwise returns a `message` and empty arrays.

### `GET /severity`

Fatality-risk analysis from the Random Forest model.

- **Features:** `hour`, `weekday`, `year`, `speed_limit`, `is_signposted`.
- **Target:** `is_fatal`.
- **Returns:**
  - `riskByHour[]` — mean predicted fatality probability per hour,
  - `featureImportances[]` — Portuguese-labelled importances, sorted descending
    (hour of day is the dominant factor, followed by year),
  - `totalAccidents`, `totalFatals`, `fatalPct` for the current filter.

### `GET /heatmap`

Accident counts per **weekday × hour**.

- **Returns:** `cells[]` with `weekday`, `weekdayName` (Portuguese), `hour`,
  `total`, and a normalised `intensity` (0–1), plus `maxTotal`.

## Models

| Concern | Model | Notes |
|---------|-------|-------|
| Forecast | Seasonal-naive (per-month mean ± 1σ) | Interpretable baseline; `statsmodels` is available for a future smoothing model but is not used for the served forecast |
| Severity | `RandomForestClassifier` (100 trees, `random_state=42`) | Trained once at startup; exposes per-feature importances |
| Heatmap | Group-by aggregation | Not a model — temporal concentration view |

## Failure handling

If the ML service is down, the backend proxy returns HTTP `503` with an `error`
message and the frontend shows a non-blocking warning while the rest of the
dashboard continues to work. The warning includes the command to start the
service.

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `DB_PATH` | `../backend/data/accidents.db` | SQLite database to read |
| `ml.service.url` (backend) | `http://localhost:8000` | Where the backend proxies `/api/ml/*` |
