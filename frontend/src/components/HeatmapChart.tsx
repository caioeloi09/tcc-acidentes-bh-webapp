import { HeatmapResponse } from '../types/ml'

interface Props {
  data: HeatmapResponse
}

const WEEKDAY_NAMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function intensityToColor(intensity: number): string {
  if (intensity === 0) return '#f8fafc'
  if (intensity < 0.2)  return '#dbeafe'
  if (intensity < 0.4)  return '#93c5fd'
  if (intensity < 0.6)  return '#3b82f6'
  if (intensity < 0.8)  return '#1d4ed8'
  return '#1e3a8a'
}

function textColor(intensity: number): string {
  return intensity >= 0.6 ? '#ffffff' : '#374151'
}

export function HeatmapChart({ data }: Props) {
  if (data.cells.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Dados insuficientes
      </div>
    )
  }

  const cellMap = new Map<string, number>()
  const intensityMap = new Map<string, number>()
  for (const cell of data.cells) {
    const key = `${cell.weekday}-${cell.hour}`
    cellMap.set(key, cell.total)
    intensityMap.set(key, cell.intensity)
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 580 }}>
        <div className="flex mb-1">
          <div className="w-20 shrink-0" />
          {HOURS.map(h => (
            <div
              key={h}
              className="flex-1 text-center text-xs text-gray-400 font-medium"
              style={{ minWidth: 20 }}
            >
              {h % 3 === 0 ? `${h}h` : ''}
            </div>
          ))}
        </div>

        {WEEKDAY_NAMES.map((name, wd) => (
          <div key={wd} className="flex items-center mb-0.5">
            <div className="w-20 shrink-0 text-xs text-gray-600 font-medium pr-2 text-right">
              {name}
            </div>
            {HOURS.map(h => {
              const key = `${wd}-${h}`
              const total = cellMap.get(key) ?? 0
              const intensity = intensityMap.get(key) ?? 0
              return (
                <div
                  key={h}
                  className="flex-1 rounded-sm flex items-center justify-center cursor-default"
                  style={{
                    minWidth: 20,
                    height: 28,
                    backgroundColor: intensityToColor(intensity),
                    color: textColor(intensity),
                    fontSize: 9,
                  }}
                  title={`${name} ${h}h — ${total.toLocaleString('pt-BR')} acidentes`}
                >
                  {total > 0 && intensity >= 0.5 ? total : ''}
                </div>
              )
            })}
          </div>
        ))}

        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-400">Menos</span>
          {[0, 0.15, 0.35, 0.55, 0.75, 1].map(v => (
            <div
              key={v}
              className="w-5 h-3 rounded-sm"
              style={{ backgroundColor: intensityToColor(v) }}
            />
          ))}
          <span className="text-xs text-gray-400">Mais acidentes</span>
        </div>
      </div>
    </div>
  )
}
