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

export function ForecastChart({ data }: Props) {
  if (data.message && data.historical.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        {data.message}
      </div>
    )
  }

  const historical = data.historical.map(p => ({
    label: `${MONTH_NAMES[p.month - 1]}/${p.year}`,
    real: p.total,
    lower: undefined as number | undefined,
    upper: undefined as number | undefined,
    forecast: undefined as number | undefined,
    isForecast: false,
  }))

  const forecastPoints = data.forecast.map(p => ({
    label: `${MONTH_NAMES[p.month - 1]}/${p.year}`,
    real: undefined as number | undefined,
    lower: p.lower,
    upper: p.upper,
    forecast: p.total,
    isForecast: true,
  }))

  const combined = [...historical, ...forecastPoints]
  const splitLabel = forecastPoints[0]?.label

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={combined} margin={{ top: 4, right: 16, left: 8, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10 }}
          interval={Math.floor(combined.length / 8)}
          angle={-30}
          textAnchor="end"
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value: number, name: string) => {
            const labels: Record<string, string> = {
              real: 'Histórico',
              forecast: 'Previsão',
              lower: 'Limite inferior',
              upper: 'Limite superior',
            }
            return [value?.toLocaleString('pt-BR'), labels[name] ?? name]
          }}
        />
        <Legend
          formatter={(value) => {
            const map: Record<string, string> = {
              real: 'Histórico',
              forecast: 'Previsão',
            }
            return map[value] ?? value
          }}
          wrapperStyle={{ fontSize: 12 }}
        />
        {splitLabel && (
          <ReferenceLine
            x={splitLabel}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{ value: 'Previsão →', position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }}
          />
        )}
        <Area
          dataKey="upper"
          fill="#c7d2fe"
          stroke="none"
          legendType="none"
          connectNulls
        />
        <Area
          dataKey="lower"
          fill="#f8fafc"
          stroke="none"
          legendType="none"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="real"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke="#f97316"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={{ r: 3 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
