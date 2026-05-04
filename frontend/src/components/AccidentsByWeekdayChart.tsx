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
import { WeekdayCount } from '../types/statistics'

interface Props {
  data: WeekdayCount[]
}

// weekday: 0 = Monday … 6 = Sunday  (conforme model Accident.kt)
const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Seg',
  1: 'Ter',
  2: 'Qua',
  3: 'Qui',
  4: 'Sex',
  5: 'Sáb',
  6: 'Dom',
}

// Weekends in a slightly different colour to highlight the contrast
const WEEKEND = new Set([5, 6])

export function AccidentsByWeekdayChart({ data }: Props) {
  const formatted = data.map(d => ({
    ...d,
    label: WEEKDAY_LABELS[d.weekday] ?? `${d.weekday}`,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Acidentes']}
          labelFormatter={(label: string) => `Dia: ${label}`}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {formatted.map((entry, i) => (
            <Cell
              key={i}
              fill={WEEKEND.has(entry.weekday) ? '#f97316' : '#3b82f6'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
