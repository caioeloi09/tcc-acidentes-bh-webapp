# TCC - Análise de Acidentes de Trânsito em Belo Horizonte

Sistema web para visualização e análise interativa de dados de acidentes de trânsito em Belo Horizonte, utilizando dados abertos da BHTrans.

## 📋 Sobre o Projeto

Este projeto é parte do Trabalho de Conclusão de Curso (TCC) do curso de Sistemas de Informação da UFMG, desenvolvido por Caio Eloi Campos sob orientação do Prof. João Guilherme Maia de Menezes.

### Objetivos

- Disponibilizar visualizações interativas de dados de acidentes de trânsito
- Permitir análise temporal e espacial dos sinistros
- Facilitar a identificação de padrões e pontos críticos
- Democratizar o acesso a informações de segurança viária

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura moderna de separação entre backend e frontend:

```
tcc-acidentes-bh-webapp/
├── backend/          # API REST em Kotlin + Spring Boot
├── frontend/         # Interface em React
└── docs/            # Documentação técnica e ADRs
```

### Stack Tecnológica

**Backend:**
- Kotlin 1.9+
- Spring Boot 3.x
- SQLite (dados consolidados)
- Gradle

**Frontend:**
- React 18+
- TypeScript
- Leaflet (mapas)
- Recharts (gráficos)
- Vite

## 🚀 Como Executar

### Pré-requisitos

- JDK 17+
- Node.js 18+
- npm ou yarn

### Backend

```bash
cd backend
./gradlew bootRun
```

A API estará disponível em `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📊 Fonte dos Dados

Os dados utilizados são provenientes do portal de dados abertos da Prefeitura de Belo Horizonte:
- [BHTrans - Dados de Acidentes](https://dados.pbh.gov.br/organization/bhtrans)

## 📝 Documentação

- [Decisões Arquiteturais (ADRs)](./docs/architecture/decisions/)
- [API Documentation](./docs/api/)
- [Guia de Contribuição](./docs/CONTRIBUTING.md)

## 👨‍🎓 Autor

**Caio Eloi Campos**
- Curso: Sistemas de Informação - UFMG
- Orientador: Prof. João Guilherme Maia de Menezes

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos como parte do TCC.

---

**Universidade Federal de Minas Gerais**  
Instituto de Ciências Exatas  
Departamento de Ciência da Computação
