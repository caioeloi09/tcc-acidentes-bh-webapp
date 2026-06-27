# Contributing Guide

This guide explains how to set up the project locally, the conventions used, and
how changes are validated. It is written for the academic context of this TCC, but
follows standard collaborative practices.

## Prerequisites

| Tool | Version |
|------|---------|
| JDK | 17+ |
| Node.js | 18+ (the frontend declares `>=16`) |
| npm | bundled with Node |
| Python | 3.10+ |
| Maven | 3.9+ (or the Maven wrapper) |

## Project layout

```
tcc-acidentes-bh-webapp/
├── backend/      # Kotlin + Spring Boot REST API
├── frontend/     # React + TypeScript dashboard
├── ml-service/   # Python + FastAPI ML microservice
├── scripts/      # Data migration (CSV → SQLite)
├── data/         # Consolidated dataset + generated DB (not versioned)
└── docs/         # Architecture, ADRs, API, data model, this guide
```

## First-time setup

1. **Get the data and build the database** (see the root README for the dataset
   link):

   ```bash
   python3 scripts/migrate_data.py
   ```

   This creates `backend/data/accidents.db`.

2. **Backend**

   ```bash
   cd backend
   mvn spring-boot:run        # http://localhost:8080
   ```

3. **ML service**

   ```bash
   cd ml-service
   pip install -r requirements.txt
   uvicorn main:app --reload  # http://localhost:8000
   ```

4. **Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev                # http://localhost:5173
   ```

All three can run independently; the dashboard degrades gracefully if the ML
service is offline.

## Running the tests

| Layer | Command | Tooling |
|-------|---------|---------|
| Backend | `cd backend && mvn test` | JUnit 5 / `kotlin-test` |
| Frontend | `cd frontend && npm test` | Vitest + Testing Library |
| Frontend (types) | `cd frontend && npx tsc --noEmit` | TypeScript |
| ML service | `cd ml-service && ruff check main.py` | Ruff lint + import check |

These mirror the CI jobs (see below), so running them locally before pushing
avoids round-trips.

## Continuous integration

`.github/workflows/ci.yml` runs three parallel jobs on every **pull request to
`main`**: backend tests, frontend type-check + tests, and ML-service lint + import
check. See
[ADR-0007](./architecture/decisions/2026-05-21-testing-and-ci-strategy.md).

A change should not be merged while any CI job is red.

## Conventions

- **Branching** — feature branches named `feat/<topic>` (e.g.
  `feat/interactive-filters`), merged into `main` via pull request, consistent
  with the existing history.
- **Commits** — short, imperative subject lines; the project uses
  Conventional-Commit-style prefixes where helpful (`feat:`, `fix:`, `ci:`,
  `chore:`).
- **Code style** — Kotlin idioms on the backend; TypeScript with explicit types
  for API responses (`frontend/src/types/`); Ruff-clean Python in the ML service.
- **Language** — code, identifiers, comments, and documentation are in **English**;
  user-facing dashboard text is in Portuguese (the product's audience).

## Architecture decisions

Significant technical decisions are recorded as ADRs in
[`docs/architecture/decisions/`](./architecture/decisions/README.md). When a
change introduces or revisits a significant decision, add a new ADR (copy
`_template.md`) in the same pull request and link it from the index.

## Documentation map

| Topic | File |
|-------|------|
| System architecture | [`docs/architecture/ARCHITECTURE.md`](./architecture/ARCHITECTURE.md) |
| Architecture decisions | [`docs/architecture/decisions/`](./architecture/decisions/README.md) |
| REST API | [`docs/api/README.md`](./api/README.md) |
| Data model & migration | [`docs/DATA_MODEL.md`](./DATA_MODEL.md) |
| ML service | [`docs/ml-service.md`](./ml-service.md) |
