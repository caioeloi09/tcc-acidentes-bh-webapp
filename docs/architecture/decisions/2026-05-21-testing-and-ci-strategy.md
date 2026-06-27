# ADR-0007: Per-layer testing strategy with GitHub Actions CI

**Date:** 2026-05-21

## Status

Accepted

## Stakeholders

- Caio Eloi Campos (Developer)
- Prof. João Guilherme Maia de Menezes (Advisor)

## Context and Problem Description

The system is composed of three independently developed layers (Kotlin backend,
React frontend, Python ML service). As features were added — interactive filters,
chart insights, predictive analytics — a strategy was needed to keep regressions
from slipping in and to validate every pull request automatically.

## Decision Criteria

- Each layer testable with its idiomatic tools
- Fast feedback on pull requests
- Low maintenance and no external infrastructure
- Catch type errors and obvious breakages before merge

## Options Considered

1. **Per-layer tests with native tooling**, orchestrated by GitHub Actions
2. **End-to-end tests only** (e.g. Cypress/Playwright against a running stack)
3. **No automated tests / manual verification**

## Decision Outcome

Chosen option: **per-layer automated tests, run on every pull request to `main`
by a GitHub Actions workflow** (`.github/workflows/ci.yml`).

The workflow runs three independent jobs:

- **Backend** — `mvn test` (JUnit 5 / `kotlin-test`), exercising
  `AccidentServiceTest` and `AccidentControllerTest`; the surefire report is
  uploaded as an artifact.
- **Frontend** — `npx tsc --noEmit` for type-checking followed by `npm test`
  (Vitest + Testing Library), covering `ChartInsight`, `FilterPanel`, and
  `StatisticsCard`.
- **ML service** — `ruff` lint plus an import smoke check (`python -c "import
  main"`) with `DB_PATH` pointed at the backend database.

### Justification

Each layer has a mature, idiomatic test runner, so testing them natively gives the
best signal with the least friction. Running the three as separate CI jobs gives
fast, parallel feedback and isolates failures to a layer. End-to-end tests were
not chosen as the primary strategy because they require orchestrating all three
services and are slower and more brittle; they remain a possible future addition.

### Positive Consequences

- Every pull request is type-checked, linted, and unit-tested automatically.
- Failures are localised to a single layer/job.
- No external CI infrastructure to maintain (GitHub-hosted runners).
- Test reports are retained as build artifacts.

### Negative Consequences

- Unit/component tests do not exercise the fully integrated, running system.
- The ML job validates linting and importability rather than model behaviour.
- Three toolchains (JDK/Maven, Node/npm, Python/pip) must be provisioned in CI.

## Pros and Cons of the Options

### Per-layer tests + GitHub Actions

**Pros:** idiomatic, fast, parallel, isolates failures, zero infra.
**Cons:** no true end-to-end coverage; ML job is shallow.

### End-to-end tests only

**Pros:** validates real user flows across the whole stack.
**Cons:** slow, brittle, needs all services running; weak unit-level diagnostics.

### No automated tests

**Pros:** nothing to build or maintain.
**Cons:** regressions go undetected; unacceptable for a graded engineering project.

## Links

- `.github/workflows/ci.yml`
- [Contributing guide](../../CONTRIBUTING.md)
