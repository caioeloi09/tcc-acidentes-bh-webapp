# Architecture Decision Records (ADRs)

This directory contains the **Architecture Decision Records** for the
*Traffic Accident Analysis in Belo Horizonte* project.

An ADR captures a single significant architectural or technical decision,
together with its context, the options that were considered, and the
consequences of the choice. ADRs are immutable: once a decision is accepted it
is not edited; if it is later changed, a new ADR is written that supersedes the
previous one.

The format used here is a lightweight variation of
[Michael Nygard's template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html).

## Index

| ADR | Date | Title | Status |
|-----|------|-------|--------|
| [0001](./2026-03-06-arquitetura-backend-frontend.md) | 2026-03-06 | Backend/Frontend separated architecture | Accepted |
| [0002](./2026-03-31-kotlin-spring-boot-backend.md) | 2026-03-31 | Kotlin + Spring Boot for the backend | Accepted |
| [0003](./2026-03-31-sqlite-database.md) | 2026-03-31 | SQLite as the read-only analytical database | Accepted |
| [0004](./2026-03-31-utm-to-wgs84-conversion.md) | 2026-03-31 | Dependency-free UTM → WGS84 conversion at migration time | Accepted |
| [0005](./2026-04-08-server-side-aggregation.md) | 2026-04-08 | Server-side aggregation for statistics | Accepted |
| [0006](./2026-05-21-rule-based-chart-insights.md) | 2026-05-21 | Rule-based chart insights instead of an LLM | Accepted |
| [0007](./2026-05-21-testing-and-ci-strategy.md) | 2026-05-21 | Per-layer testing strategy with GitHub Actions CI | Accepted |
| [0008](./2026-05-21-python-ml-microservice.md) | 2026-05-21 | Separate Python ML microservice proxied by the backend | Accepted |
| [0009](./2026-05-25-seasonal-naive-forecasting.md) | 2026-05-25 | Seasonal-naive baseline for accident forecasting | Accepted |

## Status values

- **Proposed** — under discussion, not yet acted upon.
- **Accepted** — the decision is in effect.
- **Superseded** — replaced by a later ADR (linked from the header).
- **Deprecated** — no longer relevant, but kept for the historical record.

## Writing a new ADR

1. Copy [`_template.md`](./_template.md) to a new file named
   `YYYY-MM-DD-short-title.md`.
2. Fill in the sections. Keep it focused on **one** decision.
3. Add a row to the index table above.
4. Open a pull request for review.
