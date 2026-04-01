# Backend/Frontend Separated Architecture Decision

**Date:** 2026-03-06

## Status

Accepted

## Stakeholders

- Caio Eloi Campos (Developer)
- Prof. João Guilherme Maia de Menezes (Advisor)

## Context and Problem Description

The project requires developing a web application for interactive visualization of traffic accident data. The fundamental architectural decision is to define how to structure the application: monolithic (e.g., Streamlit, Dash) or separated into backend and frontend.

## Decision Criteria

- Code scalability and maintainability
- Data processing performance
- Flexibility for future evolution
- Demonstration of technical knowledge (academic context)
- Team familiarity with the technologies
- Ease of deployment and containerization

## Options Considered

1. **Streamlit/Dash** (Python monolithic)
2. **Backend (Kotlin/Spring Boot) + Frontend (React)** separated
3. **Backend (Python/FastAPI) + Frontend (React)**

## Decision Outcome

Chosen option: **Backend (Kotlin/Spring Boot) + Frontend (React)**

### Justification

This architecture offers the best balance between demonstrating technical knowledge, performance, and scalability. The clear separation of responsibilities allows each layer to evolve independently, facilitates testing, and aligns with modern development practices.

### Positive Consequences

- **Scalability**: Backend can serve multiple clients (web, mobile, CLI)
- **Performance**: JVM optimized for processing large data volumes
- **Maintainability**: Clear separation of responsibilities
- **Testability**: Unit and integration tests made easier
- **Academic Value**: Demonstrates knowledge beyond data science
- **Reusability**: REST API can be consumed by other projects
- **Type Safety**: Kotlin and TypeScript reduce compile-time errors

### Negative Consequences

- **Initial Complexity**: Longer setup time compared to monolithic solutions
- **Learning Curve**: Requires knowledge of multiple technologies
- **Deployment**: Needs to manage two separate services

## Pros and Cons of Options

### Streamlit/Dash (Python monolithic)

**Pros:**
- Fast and simple setup
- Direct integration with Python analysis code
- Lower initial learning curve
- Ideal for prototypes

**Cons:**
- UI customization limitations
- Lower performance for complex applications
- Difficult separation of responsibilities
- Lower academic value (prototyping tool)
- Limited scalability

### Backend (Kotlin/Spring Boot) + Frontend (React)

**Pros:**
- Professional and scalable architecture
- Superior performance (JVM)
- Clear separation of responsibilities
- Rich ecosystem (Spring, React)
- Type safety in both layers
- Facilitates automated testing
- Demonstrates technical maturity

**Cons:**
- More complex initial setup
- Requires knowledge of multiple technologies
- Longer initial development time

### Backend (Python/FastAPI) + Frontend (React)

**Pros:**
- Direct integration with Python analysis code
- FastAPI is modern and performant
- Lower learning curve for backend

**Cons:**
- Lower performance than Kotlin/JVM for intensive processing
- Less developer familiarity with FastAPI
- Python type hints less robust than Kotlin

## Links

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Kotlin Documentation](https://kotlinlang.org/)
