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
import { NeighborhoodCount } from '../types/statistics'

interface Props {
  data:  NeighborhoodCount[]
  /** How many neighborhoods to show (default 10) */
  limit?: number
}

const COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#f97316', '#eab308',
  '#22c55e', '#14b8a6',
]

export function TopNeighborhoodsChart({ data, limit = 10 }: Props) {
  const top = data.slice(0, limit)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={top}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis
          dataKey="neighborhood"
          type="category"
          tick={{ fontSize: 10 }}
          width={150}
          tickFormatter={(v: string) => (v.length > 22 ? v.slice(0, 21) + '…' : v)}
        />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Acidentes']}
        />
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {top.map((_entry, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
