import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { ForecastResponse } from '../types/ml'

interface Props {
  data: ForecastResponse
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                     'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// Recharts trick: banda de confiança via dois Areas empilhados.
// O primeiro Area renderiza de 0 até `lower` com fill transparente (invisível).
// O segundo Area renderiza de `lower` até `upper` com fill colorido — dando o efeito de banda.
// Ambos usam stackId="ci" para que o Recharts os empilhe corretamente.

export function ForecastChart({ data }: Props) {
  if (data.message && data.historical.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        {data.message}
      </div>
    )
  }

  // Mostra apenas os últimos 24 meses do histórico para dar espaço visual à previsão
  const HISTORY_WINDOW = 24
  const recentHistorical = data.historical.slice(-HISTORY_WINDOW)

  const historical = recentHistorical.map(p => ({
    label: `${MONTH_NAMES[p.month - 1]}/${p.year}`,
    real: p.total,
    ciBase: undefined as number | undefined,
    ciWidth: undefined as number | undefined,
    forecast: undefined as number | undefined,
  }))

  const forecastPoints = data.forecast.map(p => ({
    label: `${MONTH_NAMES[p.month - 1]}/${p.year}`,
    real: undefined as number | undefined,
    ciBase: Math.max(0, p.lower ?? 0),
    ciWidth: Math.max(0, (p.upper ?? 0) - Math.max(0, p.lower ?? 0)),
    forecast: p.total,
  }))

  const combined = [...historical, ...forecastPoints]
  const splitLabel = forecastPoints[0]?.label

  // Com ~30 pontos no total, mostra um tick a cada 3 meses
  const tickInterval = 2

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={combined} margin={{ top: 8, right: 24, left: 8, bottom: 32 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#6b7280' }}
          interval={tickInterval}
          angle={-35}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickFormatter={(v: number) => v.toLocaleString('pt-BR')}
          width={55}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            const labels: Record<string, string> = {
              real: 'Histórico',
              forecast: 'Previsão',
              ciBase: 'Limite inferior',
              ciWidth: 'Intervalo de confiança',
            }
            return [value?.toLocaleString('pt-BR'), labels[name] ?? name]
          }}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend
          formatter={(value) => {
            const map: Record<string, string> = {
              real: 'Histórico',
              forecast: 'Previsão',
            }
            return map[value] ?? value
          }}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />

        {/* Linha divisória entre histórico e previsão */}
        {splitLabel && (
          <ReferenceLine
            x={splitLabel}
            stroke="#94a3b8"
            strokeDasharray="5 4"
            label={{
              value: 'Previsão →',
              position: 'insideTopRight',
              fontSize: 10,
              fill: '#94a3b8',
              dy: -4,
            }}
          />
        )}

        {/* Banda de confiança: base transparente + topo colorido empilhados */}
        <Area
          dataKey="ciBase"
          stackId="ci"
          fill="transparent"
          stroke="none"
          legendType="none"
          connectNulls
          isAnimationActive={false}
        />
        <Area
          dataKey="ciWidth"
          stackId="ci"
          fill="#c7d2fe"
          fillOpacity={0.5}
          stroke="none"
          legendType="none"
          connectNulls
          isAnimationActive={false}
        />

        {/* Linha histórica */}
        <Line
          type="monotone"
          dataKey="real"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          connectNulls
        />

        {/* Linha de previsão */}
        <Line
          type="monotone"
          dataKey="forecast"
          stroke="#f97316"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
