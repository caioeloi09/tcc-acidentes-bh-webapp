import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { SeverityResponse } from '../types/ml'

interface Props {
  data: SeverityResponse
}

function riskColor(risk: number): string {
  if (risk < 0.02) return '#22c55e'
  if (risk < 0.05) return '#eab308'
  return '#ef4444'
}

export function SeverityChart({ data }: Props) {
  if (data.riskByHour.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Dados insuficientes
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-6 text-sm">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">
            {data.fatalPct.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%
          </p>
          <p className="text-gray-500 text-xs">taxa de fatalidade</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700">
            {data.totalFatals.toLocaleString('pt-BR')}
          </p>
          <p className="text-gray-500 text-xs">acidentes fatais</p>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 mb-1">Fatores de risco (importância)</p>
          <div className="space-y-1">
            {data.featureImportances.slice(0, 4).map(f => (
              <div key={f.feature} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-32 shrink-0">{f.feature}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${(f.importance * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-10 text-right">
                  {(f.importance * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">
          Risco médio de fatalidade por hora do dia
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data.riskByHour} margin={{ top: 2, right: 8, left: 0, bottom: 2 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10 }}
              tickFormatter={(h: number) => `${h}h`}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
            />
            <Tooltip
              formatter={(v: number) => [`${(v * 100).toFixed(2)}%`, 'Risco de fatalidade']}
              labelFormatter={(h: number) => `${h}h`}
            />
            <Bar dataKey="avgRisk" radius={[3, 3, 0, 0]}>
              {data.riskByHour.map((entry, i) => (
                <Cell key={i} fill={riskColor(entry.avgRisk)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> Baixo (&lt;2%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-400 inline-block" /> Médio (2–5%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Alto (&gt;5%)</span>
        </div>
      </div>
    </div>
  )
}
