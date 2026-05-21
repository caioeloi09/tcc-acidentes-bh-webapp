interface YearPoint     { year:         number; total: number }
interface HourPoint     { hour:         number; total: number }
interface WeekdayPoint  { weekday:      number; total: number }
interface TypePoint     { type:         string; total: number }
interface NeighborPoint { neighborhood: string; total: number }

const WEEKDAY_NAMES: Record<number, string> = {
  0: 'Segunda-feira', 1: 'Terça-feira', 2: 'Quarta-feira',
  3: 'Quinta-feira',  4: 'Sexta-feira', 5: 'Sábado', 6: 'Domingo',
}

function maxBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
  return arr.reduce<T | undefined>(
    (best, cur) => (best === undefined || fn(cur) > fn(best) ? cur : best),
    undefined,
  )
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR')
}

function insightByYear(data: YearPoint[]): string {
  if (data.length === 0) return ''

  const peak    = maxBy(data, d => d.total)!
  const first   = data[0]
  const last    = data[data.length - 1]
  const delta   = last.total - first.total
  const trend   = delta > 0
    ? `crescimento de ${fmt(Math.abs(delta))} acidentes em relação a ${first.year}`
    : `redução de ${fmt(Math.abs(delta))} acidentes em relação a ${first.year}`

  return `O ano com mais acidentes foi ${peak.year} (${fmt(peak.total)} registros). ` +
         `Entre ${first.year} e ${last.year} houve ${trend}.`
}

function insightByHour(data: HourPoint[]): string {
  if (data.length === 0) return ''

  const peak   = maxBy(data, d => d.total)!
  const total  = data.reduce((s, d) => s + d.total, 0)
  const pct    = ((peak.total / total) * 100).toFixed(1)
  const period = peak.hour >= 6 && peak.hour < 12 ? 'manhã'
               : peak.hour >= 12 && peak.hour < 18 ? 'tarde'
               : peak.hour >= 18 && peak.hour < 24 ? 'noite' : 'madrugada'

  return `O horário de maior incidência é às ${peak.hour}h (${pct}% dos acidentes), ` +
         `coincidindo com o pico de tráfego da ${period}. ` +
         `Atenção redobrada nesse intervalo pode reduzir riscos.`
}

function insightByWeekday(data: WeekdayPoint[]): string {
  if (data.length === 0) return ''

  const peak     = maxBy(data, d => d.total)!
  const weekdays = data.filter(d => d.weekday <= 4)
  const weekends = data.filter(d => d.weekday >= 5)

  const avgWeekday = weekdays.length
    ? weekdays.reduce((s, d) => s + d.total, 0) / weekdays.length
    : 0
  const avgWeekend = weekends.length
    ? weekends.reduce((s, d) => s + d.total, 0) / weekends.length
    : 0

  const comparison = avgWeekday > avgWeekend
    ? `Dias úteis concentram mais acidentes (média ${fmt(Math.round(avgWeekday))} vs ${fmt(Math.round(avgWeekend))} nos fins de semana)`
    : `Fins de semana apresentam maior média (${fmt(Math.round(avgWeekend))} vs ${fmt(Math.round(avgWeekday))} nos dias úteis)`

  return `${WEEKDAY_NAMES[peak.weekday]} é o dia com mais acidentes (${fmt(peak.total)} registros). ` +
         `${comparison}, possivelmente ligado a saídas noturnas e álcool.`
}

function insightByType(data: TypePoint[]): string {
  if (data.length === 0) return ''

  const total = data.reduce((s, d) => s + d.total, 0)
  const top   = data[0]
  const pct   = ((top.total / total) * 100).toFixed(1)
  const name  = top.type.charAt(0) + top.type.slice(1).toLowerCase()

  return `"${name}" é o tipo mais frequente, representando ${pct}% de todos os acidentes ` +
         `(${fmt(top.total)} ocorrências). Melhorias na sinalização e fiscalização ` +
         `podem reduzir esse índice.`
}

function insightByNeighborhood(data: NeighborPoint[]): string {
  if (data.length === 0) return ''

  const top    = data[0]
  const second = data[1]

  const secondText = second
    ? ` seguido por ${second.neighborhood} (${fmt(second.total)})`
    : ''

  return `${top.neighborhood} concentra o maior número de acidentes ` +
         `(${fmt(top.total)} registros)${secondText}. ` +
         `Bairros com alto volume de tráfego e cruzamentos movimentados ` +
         `tendem a liderar esse ranking.`
}

type ChartType = 'byYear' | 'byHour' | 'byWeekday' | 'byType' | 'topNeighborhoods'

interface Props {
  chartType: ChartType
  
  data: any[]
}

function generateInsight(chartType: ChartType, data: Props['data']): string {
  switch (chartType) {
    case 'byYear':          return insightByYear(data as YearPoint[])
    case 'byHour':          return insightByHour(data as HourPoint[])
    case 'byWeekday':       return insightByWeekday(data as WeekdayPoint[])
    case 'byType':          return insightByType(data as TypePoint[])
    case 'topNeighborhoods':return insightByNeighborhood(data as NeighborPoint[])
    default:                return ''
  }
}

export function ChartInsight({ chartType, data }: Props) {
  const text = generateInsight(chartType, data)
  if (!text) return null

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
      <span className="text-base leading-none mt-0.5 shrink-0" aria-hidden>💡</span>
      <div>
        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
          Como interpretar
        </span>
        <p className="mt-0.5 text-sm text-gray-500 leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  )
}
