# ADR-0003: SQLite as the read-only analytical database

**Date:** 2026-03-31

## Status

Accepted

## Stakeholders

- Caio Eloi Campos (Developer)
- Prof. João Guilherme Maia de Menezes (Advisor)

## Context and Problem Description

The application serves a **fixed, historical dataset** of traffic accidents in
Belo Horizonte (BHTrans open data, 2016–2023). After cleaning and consolidation
in the first phase of the project, the data is migrated into a single table of
~97k rows (see [the data model](../../DATA_MODEL.md)). The dataset is essentially
**read-only at runtime**: the web application queries and aggregates it but never
writes to it.

A storage engine is needed that the Spring Boot backend (and the Python ML
service) can both read, that requires no separate server process, and that is
trivial to reproduce from the migration script.

## Decision Criteria

- Operational simplicity (no separate DB server to install/run)
- Reproducibility (the database is regenerated from a script)
- Adequate read/aggregation performance at this data scale
- Ability to be read from both the JVM backend and the Python ML service
- Ease of local development and CI

## Options Considered

1. **SQLite** (embedded, single file)
2. **PostgreSQL** (client/server RDBMS)
3. **In-memory H2** (JVM-only embedded database)

## Decision Outcome

Chosen option: **SQLite**, stored as a single file at `backend/data/accidents.db`.

The backend connects through the `org.xerial:sqlite-jdbc` driver and Hibernate's
`hibernate-community-dialects` SQLite dialect, with `ddl-auto: none` (the schema
is owned by the migration script, not by Hibernate). The Python ML service opens
the very same file with the standard-library `sqlite3` module. The migration
script (`scripts/migrate_data.py`) creates the table and its indexes.

### Justification

At ~97k rows the workload is small and read-only, so a full client/server RDBMS
would add operational overhead without a tangible benefit. SQLite stores
everything in one file that is generated deterministically from the consolidated
CSV, which makes the whole system reproducible and easy to share. Because the
file is just a file, both the JVM backend and the Python service can read it
without any inter-process database protocol. H2 was rejected because it is
JVM-only and could not be shared with the Python ML service.

### Positive Consequences

- Zero-administration: no database server to install, start, or secure.
- The database is a build artifact — `python scripts/migrate_data.py` recreates it.
- Shared transparently between the Kotlin backend and the Python ML service.
- Query performance is supported by explicit indexes created during migration
  (district, neighborhood, year/month, type, coordinates).

### Negative Consequences

- Limited concurrent-write support — acceptable because the workload is read-only.
- Not suitable as-is for a multi-user, write-heavy production system.
- Aggregations load entity lists into memory in some service paths
  (see [ADR-0005](./2026-04-08-server-side-aggregation.md)), which is fine at this
  scale but would not scale to millions of rows.

## Pros and Cons of the Options

### SQLite

**Pros:** serverless, reproducible, language-agnostic file, indexed reads.
**Cons:** weak concurrent writes; not a production multi-user store.

### PostgreSQL

**Pros:** production-grade, concurrent, rich SQL/feature set.
**Cons:** requires a running server and provisioning; overkill for a fixed, read-only dataset.

### In-memory H2

**Pros:** trivial to spin up inside the JVM for tests.
**Cons:** JVM-only (cannot be shared with the Python service); not persistent by default.

## Links

- [ADR-0002 — Kotlin + Spring Boot for the backend](./2026-03-31-kotlin-spring-boot-backend.md)
- [ADR-0008 — Separate Python ML microservice](./2026-05-21-python-ml-microservice.md)
- [Data model and migration pipeline](../../DATA_MODEL.md)
