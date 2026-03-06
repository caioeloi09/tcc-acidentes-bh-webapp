# Escolha da Arquitetura Backend/Frontend Separados

**Data:** 2026-03-06

## Status

Aceito

## Responsáveis

- Caio Eloi Campos (Desenvolvedor)
- Prof. João Guilherme Maia de Menezes (Orientador)

## Contexto e Descrição do Problema

O projeto requer o desenvolvimento de uma aplicação web para visualização interativa de dados de acidentes de trânsito. A decisão arquitetural fundamental é definir como estruturar a aplicação: monolítica (ex: Streamlit, Dash) ou separada em backend e frontend.

## Critérios de Decisão

- Escalabilidade e manutenibilidade do código
- Performance no processamento de dados
- Flexibilidade para evolução futura
- Demonstração de conhecimento técnico (contexto acadêmico)
- Familiaridade da equipe com as tecnologias
- Facilidade de deploy e containerização

## Opções Consideradas

1. **Streamlit/Dash** (Python monolítico)
2. **Backend (Kotlin/Spring Boot) + Frontend (React)** separados
3. **Backend (Python/FastAPI) + Frontend (React)**

## Resultado da Decisão

Opção escolhida: **Backend (Kotlin/Spring Boot) + Frontend (React)**

### Justificativa

Esta arquitetura oferece o melhor equilíbrio entre demonstração de conhecimento técnico, performance e escalabilidade. A separação clara de responsabilidades permite que cada camada evolua independentemente, facilita testes e está alinhada com práticas modernas de desenvolvimento.

### Consequências Positivas

- **Escalabilidade**: Backend pode servir múltiplos clientes (web, mobile, CLI)
- **Performance**: JVM otimizada para processamento de grandes volumes de dados
- **Manutenibilidade**: Separação clara de responsabilidades
- **Testabilidade**: Testes unitários e de integração facilitados
- **Valor Acadêmico**: Demonstra conhecimento além de ciência de dados
- **Reutilização**: API REST pode ser consumida por outros projetos
- **Type Safety**: Kotlin e TypeScript reduzem erros em tempo de compilação

### Consequências Negativas

- **Complexidade inicial**: Maior tempo de setup comparado a soluções monolíticas
- **Curva de aprendizado**: Requer conhecimento de múltiplas tecnologias
- **Deploy**: Necessita gerenciar dois serviços separados

## Prós e Contras das Opções

### Streamlit/Dash (Python monolítico)

**Prós:**
- Setup rápido e simples
- Integração direta com código Python de análise
- Menor curva de aprendizado inicial
- Ideal para protótipos

**Contras:**
- Limitações de customização de UI
- Performance inferior para aplicações complexas
- Difícil separação de responsabilidades
- Menor valor acadêmico (ferramenta de prototipagem)
- Escalabilidade limitada

### Backend (Kotlin/Spring Boot) + Frontend (React)

**Prós:**
- Arquitetura profissional e escalável
- Performance superior (JVM)
- Separação clara de responsabilidades
- Ecossistema rico (Spring, React)
- Type safety em ambas as camadas
- Facilita testes automatizados
- Demonstra maturidade técnica

**Contras:**
- Setup inicial mais complexo
- Requer conhecimento de múltiplas tecnologias
- Maior tempo de desenvolvimento inicial

### Backend (Python/FastAPI) + Frontend (React)

**Prós:**
- Integração direta com código de análise em Python
- FastAPI é moderno e performático
- Menor curva de aprendizado no backend

**Contras:**
- Performance inferior ao Kotlin/JVM para processamento intensivo
- Menor familiaridade do desenvolvedor com FastAPI
- Type hints do Python menos robustos que Kotlin

## Links

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Kotlin Documentation](https://kotlinlang.org/)
