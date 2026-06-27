# Frontend - Interactive Dashboard

Web interface developed in React for interactive visualization of accident data.

## Technologies

- React 18+
- TypeScript
- Vite
- Leaflet (maps)
- Recharts (charts)
- TailwindCSS

## Structure

```
frontend/
├── src/
│   ├── App.tsx          # Dashboard composition + data orchestration
│   ├── main.tsx         # Entry point
│   ├── components/      # Charts, map, filters, ML views, insights (+ *.test.tsx)
│   ├── services/        # api.ts — single Axios client (/api)
│   ├── types/           # TypeScript types mirroring API responses
│   ├── test/            # Vitest setup
│   └── index.css        # TailwindCSS entry
├── index.html
├── vite.config.ts       # Vite + dev proxy (/api → :8080) + Vitest config
├── package.json
└── README.md
```

## How to Run

```bash
npm install
npm run dev     # http://localhost:5173
```

The dev server proxies `/api` to the backend at `http://localhost:8080`, so the
backend must be running for data to load (the predictive section additionally
needs the ML service).

## Testing

```bash
npm test            # Vitest (run once)
npm run test:watch  # watch mode
npx tsc --noEmit    # type-check
```

## Features

- Interactive map with accident locations (Leaflet + OpenStreetMap)
- Temporal and categorical charts (year, hour, weekday, type, top neighborhoods)
- Dynamic filters by year, region, and accident type
- Key-statistics cards
- Rule-based "how to interpret" insight under each chart
- Predictive section: accident forecast, severity analysis, temporal heatmap

## Related docs

- [REST API reference](../docs/api/README.md)
- [System architecture](../docs/architecture/ARCHITECTURE.md)
