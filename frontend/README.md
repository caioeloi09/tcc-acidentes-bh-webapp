# Frontend - Dashboard Interativo

Interface web desenvolvida em React para visualização interativa dos dados de acidentes.

## Tecnologias

- React 18+
- TypeScript
- Vite
- Leaflet (mapas)
- Recharts (gráficos)
- TailwindCSS

## Estrutura

```
frontend/
├── src/
│   ├── components/      # Componentes React
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Chamadas à API
│   ├── hooks/          # Custom hooks
│   ├── types/          # TypeScript types
│   └── utils/          # Funções utilitárias
├── public/
├── package.json
└── README.md
```

## Como Executar

```bash
npm install
npm run dev
```

Aplicação disponível em: `http://localhost:5173`

## Funcionalidades

- 🗺️ Mapa interativo com localização de acidentes
- 📊 Gráficos de análise temporal
- 🔍 Filtros por data, tipo, região
- 📈 Dashboard com estatísticas principais
