# ADR-0002: Kotlin + Spring Boot for the backend

**Date:** 2026-03-31

## Status

Accepted

## Stakeholders

- Caio Eloi Campos (Developer)
- Prof. João Guilherme Maia de Menezes (Advisor)

## Context and Problem Description

[ADR-0001](./2026-03-06-arquitetura-backend-frontend.md) established a separated
backend/frontend architecture, with the backend exposing a REST API. This ADR
records the choice of language and framework for that backend layer.

The backend has a focused responsibility: read the consolidated accident dataset
from a local database, expose it through a small set of REST endpoints, and
compute aggregated statistics on demand. It must be type-safe, easy to test, and
demonstrate competencies expected from an Information Systems graduate.

## Decision Criteria

- Type safety and compile-time guarantees
- Maturity of the web/ORM ecosystem
- Productivity and conciseness
- Testability
- Academic value (demonstrating engineering knowledge beyond data science)
- Interoperability with the JVM ecosystem

## Options Considered

1. **Kotlin + Spring Boot** (JVM)
2. **Java + Spring Boot** (JVM)
3. **Node.js + Express/NestJS** (JavaScript/TypeScript)

## Decision Outcome

Chosen option: **Kotlin + Spring Boot 3.2** (Java 17).

The application is a standard Spring Boot service (`AccidentsApplication`) using
**Spring Web** for the REST layer and **Spring Data JPA** (Hibernate) for
persistence. The code follows an MVC layering of `controller → service →
repository → model`. Kotlin compiler plugins (`spring`, `jpa`, `all-open`,
`no-arg`) are configured in `pom.xml` so that entities and beans work correctly
with the framework.

### Justification

Kotlin offers null-safety and concise data classes that map naturally to JPA
entities and to JSON responses, while Spring Boot provides a mature, well-known
ecosystem for REST APIs and data access. Compared to Java, Kotlin removes a large
amount of boilerplate (the `Accident` entity and the aggregation logic in
`AccidentService` stay compact) without giving up the JVM ecosystem. Compared to
Node.js, the JVM provides stronger typing end-to-end and a richer data-access
story for the aggregation queries.

### Positive Consequences

- Null-safety reduces a whole class of runtime errors.
- Spring Data JPA repositories express the aggregation queries declaratively
  (`@Query` methods in `AccidentRepository`).
- Familiar, well-documented stack with first-class testing support
  (`spring-boot-starter-test`, `kotlin-test-junit5`).
- Type safety is consistent with the TypeScript frontend.

### Negative Consequences

- JVM startup time and memory footprint are higher than a Node.js process.
- Requires JDK 17+ on the development machine and in CI.
- Kotlin + JPA requires the all-open/no-arg compiler plugins, an extra piece of
  build configuration.

## Pros and Cons of the Options

### Kotlin + Spring Boot

**Pros:** null-safety, concise, mature ecosystem, strong testing, high academic value.
**Cons:** JVM footprint, build-plugin configuration.

### Java + Spring Boot

**Pros:** same ecosystem, most widely documented.
**Cons:** significantly more boilerplate; no null-safety.

### Node.js + Express/NestJS

**Pros:** shares the language with the frontend; lightweight runtime.
**Cons:** weaker data-access ecosystem for aggregations; less type-safety than Kotlin/JPA.

## Links

- [ADR-0001 — Backend/Frontend separated architecture](./2026-03-06-arquitetura-backend-frontend.md)
- [ADR-0003 — SQLite as the read-only analytical database](./2026-03-31-sqlite-database.md)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Kotlin Documentation](https://kotlinlang.org/)
