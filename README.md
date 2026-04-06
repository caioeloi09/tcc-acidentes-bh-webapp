# TCC - Traffic Accident Analysis in Belo Horizonte

Web system for interactive visualization and analysis of traffic accident data in Belo Horizonte, using open data from BHTrans.

## About the Project

This project is part of the Final Paper (TCC) for the Information Systems program at UFMG, developed by Caio Eloi Campos under the supervision of Prof. João Guilherme Maia de Menezes.

### Goals

- Provide interactive visualizations of traffic accident data
- Enable temporal and spatial analysis of incidents
- Facilitate the identification of patterns and critical points
- Democratize access to road safety information

## Architecture

The project uses a modern separated backend/frontend architecture:

```
tcc-acidentes-bh-webapp/
├── backend/          # REST API in Kotlin + Spring Boot
├── frontend/         # React interface
└── docs/            # Technical documentation and ADRs
```

### Tech Stack

**Backend:**
- Kotlin 1.9+
- Spring Boot 3.x
- SQLite (consolidated data)
- Maven

**Frontend:**
- React 18+
- TypeScript
- Leaflet (maps)
- Recharts (charts)
- Vite

## How to Run

### Prerequisites

- JDK 17+
- Node.js 18+
- npm or yarn
- Python 3+

### 1. Download the Consolidated Data

The application requires a pre-processed CSV file with the consolidated accident data. Download it from the link below and save it as `data/dataset_consolidado.csv` in the project root:

- [dataset_consolidado.csv](https://docs.google.com/spreadsheets/d/1mPqI2mCbbBBqxm-YUBLoE1IFwBDjB01SOgdRtPTR1mk/edit?usp=sharing)

### 2. Run the Data Migration Script

This script reads the CSV and generates the SQLite database used by the backend:

```bash
python3 scripts/migrate_data.py
```

### 3. Backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## Data Source

Data is sourced from the open data portal of the Belo Horizonte City Hall:
- [BHTrans - Accident Data](https://dados.pbh.gov.br/organization/bhtrans)

## Documentation

- [Architectural Decisions (ADRs)](./docs/architecture/decisions/)
- [API Documentation](./docs/api/)
- [Contribution Guide](./docs/CONTRIBUTING.md)

## Author

**Caio Eloi Campos**
- Program: Information Systems - UFMG
- Advisor: Prof. João Guilherme Maia de Menezes

## License

This project is developed for academic purposes as part of the TCC.

---

**Universidade Federal de Minas Gerais**
Instituto de Ciências Exatas
Departamento de Ciência da Computação
