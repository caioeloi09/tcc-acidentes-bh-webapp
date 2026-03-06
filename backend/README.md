# Backend - API REST

API REST desenvolvida em Kotlin + Spring Boot para servir dados de acidentes de trânsito.

## Tecnologias

- Kotlin 1.9+
- Spring Boot 3.x
- Spring Data JPA
- SQLite
- Gradle

## Estrutura

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
│   │   │       └── config/        # Configurações
│   │   └── resources/
│   │       ├── application.yml
│   │       └── data/
│   └── test/
├── build.gradle.kts
└── README.md
```

## Como Executar

```bash
./gradlew bootRun
```

API disponível em: `http://localhost:8080`

## Endpoints Principais

- `GET /api/acidentes` - Lista acidentes com filtros
- `GET /api/acidentes/{id}` - Detalhes de um acidente
- `GET /api/estatisticas` - Estatísticas gerais
- `GET /api/mapa` - Dados para visualização em mapa
