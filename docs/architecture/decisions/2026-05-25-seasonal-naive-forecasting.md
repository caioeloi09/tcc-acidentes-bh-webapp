# ADR-0009: Seasonal-naive baseline for accident forecasting

**Date:** 2026-05-25

## Status

Accepted

## Stakeholders

- Caio Eloi Campos (Developer)
- Prof. João Guilherme Maia de Menezes (Advisor)

## Context and Problem Description

The predictive section ([ADR-0008](./2026-05-21-python-ml-microservice.md))
includes a forecast of the monthly number of accidents, with an uncertainty band,
that must also respond to the active filters (year, district, type). A forecasting
method is needed that is interpretable, robust on the available history (monthly
counts, 2016–2023), and honest about uncertainty.

## Decision Criteria

- Interpretability and explainability to a general audience
- Robustness on short/filtered monthly series
- Captures the strong **seasonality** of accidents (month-of-year effects)
- Provides an uncertainty band
- Simplicity as a baseline against which richer models can be compared

## Options Considered

1. **Seasonal-naive** forecast (per-month historical mean ± 1σ)
2. **Holt-Winters / Exponential Smoothing** (`statsmodels`)
3. **ARIMA/SARIMA** or other parametric time-series models

## Decision Outcome

Chosen option: a **seasonal-naive** forecast implemented in
`ml-service/main.py` (`GET /forecast`).

For each future month the forecast is the **mean of the historical totals for that
same calendar month**, and the uncertainty band is **± one standard deviation** of
those same-month values (falling back to ±10% when only a single observation
exists). The endpoint returns the historical series together with the projected
points (`total`, `lower`, `upper`); the frontend renders the last 24 months plus a
6-month projection.

> Note: `statsmodels` (incl. `ExponentialSmoothing`) is listed as a dependency and
> imported, but the **method actually served is the seasonal-naive baseline**
> described above. This keeps the door open for a smoothing/parametric model later
> without changing the API contract.

### Justification

Accident counts are dominated by month-of-year seasonality (rainy season,
holidays), which a seasonal-naive method captures directly and transparently. As a
baseline it is easy to explain to non-specialists and is robust even when filters
shrink the series, where fitting a parametric model (Holt-Winters, ARIMA) would be
unreliable. It also yields a simple, defensible uncertainty band. Per forecasting
practice, a strong naive baseline is the correct first model and the reference
point for evaluating anything more complex.

### Positive Consequences

- Transparent and easy to explain ("each month repeats its historical average").
- Robust under filtering and on short series; degrades gracefully.
- Provides an interpretable ±1σ uncertainty band.
- Serves as the baseline for future, more sophisticated models.

### Negative Consequences

- Does not model trend or change-points beyond the per-month average.
- Assumes the seasonal pattern is stationary across years.
- A dependency (`statsmodels`) is present but not yet used for the served forecast.
- Requires at least six months of history (otherwise it returns an
  "insufficient data" message).

## Pros and Cons of the Options

### Seasonal-naive (mean ± 1σ)

**Pros:** interpretable, robust, captures seasonality, gives an uncertainty band.
**Cons:** no explicit trend modelling; assumes stationary seasonality.

### Holt-Winters / Exponential Smoothing

**Pros:** models level, trend, and seasonality together.
**Cons:** less robust on short/filtered series; harder to explain; needs tuning.

### ARIMA/SARIMA

**Pros:** powerful, well-grounded parametric family.
**Cons:** order selection and stationarity handling add complexity; brittle on filtered subsets.

## Links

- `ml-service/main.py`
- [ML service documentation](../../ml-service.md)
- [ADR-0008 — Separate Python ML microservice](./2026-05-21-python-ml-microservice.md)
