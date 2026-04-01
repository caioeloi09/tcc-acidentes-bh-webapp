# Backend - REST API

REST API developed in Kotlin + Spring Boot to serve traffic accident data.

## Technologies

- Kotlin 1.9+
- Spring Boot 3.x
- Spring Data JPA
- SQLite
- Maven

## Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── br/ufmg/tcc/acidentes/
│   │   │       ├── controller/    # REST Controllers
│   │   │       ├── service/       # Business Logic
│   │   │       ├── repository/    # Data Access
│   │   │       ├── model/         # Domain Models
│   │   │       └── config/        # Configuration
│   │   └── resources/
│   │       ├── application.yml
│   │       └── data/
│   └── test/
├── pom.xml
└── README.md
```

## How to Run

```bash
mvn spring-boot:run
```

API available at: `http://localhost:8080`

## Main Endpoints

- `GET /api/accidents` - List accidents with optional filters
- `GET /api/accidents/{id}` - Details of a specific accident
- `GET /api/statistics` - General statistics
- `GET /api/map` - Data for map visualization
