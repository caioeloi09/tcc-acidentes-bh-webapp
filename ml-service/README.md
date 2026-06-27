# ML Service — Predictive Analytics

FastAPI microservice that serves the dashboard's predictive and statistical
analytics on top of the accident database. The Spring Boot backend proxies it
under `/api/ml/*`; the browser never calls it directly.

## Technologies

- Python 3.10+
- FastAPI + Uvicorn
- scikit-learn (Random Forest severity model)
- statsmodels, pandas, numpy

## How to Run

```bash
pip install -r requirements.txt
uvicorn main:app --reload     # http://localhost:8000
```

Reads the SQLite database at `DB_PATH` (default `../backend/data/accidents.db`),
which must be generated first via `python3 scripts/migrate_data.py` from the
project root.

## Endpoints

- `GET /health` — liveness probe
- `GET /forecast` — seasonal-naive monthly forecast (`periods`, default 3)
- `GET /severity` — Random Forest fatality-risk analysis + feature importances
- `GET /heatmap` — accident counts per weekday × hour

All accept the shared `year` / `district` / `type` filters.

## Full documentation

See [`docs/ml-service.md`](../docs/ml-service.md) and the related ADRs:
[ADR-0008](../docs/architecture/decisions/2026-05-21-python-ml-microservice.md),
[ADR-0009](../docs/architecture/decisions/2026-05-25-seasonal-naive-forecasting.md).
