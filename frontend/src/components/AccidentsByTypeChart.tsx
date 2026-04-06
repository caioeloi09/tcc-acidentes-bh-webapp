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
import { TypeCount } from '../types/statistics'

interface Props {
  data: TypeCount[]
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e']

export function AccidentsByTypeChart({ data }: Props) {
  const top = data.slice(0, 6)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={top}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis
          dataKey="type"
          type="category"
          tick={{ fontSize: 10 }}
          width={160}
          tickFormatter={(v: string) =>
            v.length > 26 ? v.slice(0, 25) + '…' : v
          }
        />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), 'Accidents']}
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
