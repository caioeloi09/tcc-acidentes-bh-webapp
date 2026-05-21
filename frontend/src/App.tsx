import { useEffect, useRef, useState } from 'react'
import { StatisticsCard } from './components/StatisticsCard'
import { AccidentsByYearChart } from './components/AccidentsByYearChart'
import { AccidentsByHourChart } from './components/AccidentsByHourChart'
import { AccidentsByTypeChart } from './components/AccidentsByTypeChart'
import { AccidentsByWeekdayChart } from './components/AccidentsByWeekdayChart'
import { TopNeighborhoodsChart } from './components/TopNeighborhoodsChart'
import { AccidentsMap } from './components/AccidentsMap'
import { FilterPanel, ActiveFilters, EMPTY_FILTERS } from './components/FilterPanel'
import { ChartInsight } from './components/ChartInsight'
import { api } from './services/api'
import { Statistics } from './types/statistics'

export default function App() {
  
  const [baseStats, setBaseStats] = useState<Statistics | null>(null)

  
  const [stats, setStats] = useState<Statistics | null>(null)

  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS)

  
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)

  const [error, setError] = useState<string | null>(null)

  
  const isFirstRender = useRef(true)

  
  useEffect(() => {
    api.getStatistics()
      .then(data => {
        setBaseStats(data)
        setStats(data)
      })
      .catch(() =>
        setError('Falha ao carregar dados. Verifique se o backend está rodando na porta 8080.')
      )
      .finally(() => setLoading(false))
  }, [])

  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setFiltering(true)
    api.getStatistics(filters)
      .then(setStats)
      .catch(console.error)
      .finally(() => setFiltering(false))
  }, [filters])

  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Carregando dashboard…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    )
  }

  const hasFilter =
    filters.year !== null || filters.district !== null || filters.type !== null

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard de Acidentes de Trânsito – BH
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Dados BHTrans · 2016 – 2023 ·{' '}
          {hasFilter
            ? `${stats?.totalAccidents.toLocaleString('pt-BR')} acidentes no recorte selecionado`
            : `${baseStats?.totalAccidents.toLocaleString('pt-BR')} acidentes no total`}
        </p>
      </header>

      <main className="p-6 space-y-6">
        {}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-3">
          <FilterPanel
            baseStats={baseStats}
            filters={filters}
            loading={filtering}
            onChange={setFilters}
          />
        </section>

        {}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatisticsCard
            label="Total de Acidentes"
            value={stats?.totalAccidents.toLocaleString('pt-BR') ?? '-'}
          />
          <StatisticsCard
            label="Acidentes Fatais"
            value={stats?.totalFatalities.toLocaleString('pt-BR') ?? '-'}
            highlight
          />
          <StatisticsCard
            label="Regionais"
            value={stats?.byDistrict.length.toLocaleString('pt-BR') ?? '-'}
          />
          <StatisticsCard
            label="Período"
            value={hasFilter && filters.year ? `${filters.year}` : '2016 – 2023'}
          />
        </section>

        {}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Acidentes por Ano
            </h2>
            <AccidentsByYearChart data={stats?.byYear ?? []} />
            <ChartInsight chartType="byYear" data={stats?.byYear ?? []} />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Acidentes por Hora do Dia
            </h2>
            <AccidentsByHourChart data={stats?.byHour ?? []} />
            <ChartInsight chartType="byHour" data={stats?.byHour ?? []} />
          </div>
        </section>

        {}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Acidentes por Dia da Semana
            </h2>
            <AccidentsByWeekdayChart data={stats?.byWeekday ?? []} />
            <ChartInsight chartType="byWeekday" data={stats?.byWeekday ?? []} />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Acidentes por Tipo
            </h2>
            <AccidentsByTypeChart data={stats?.byType ?? []} />
            <ChartInsight chartType="byType" data={stats?.byType ?? []} />
          </div>
        </section>

        {}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Top 10 Bairros com Mais Acidentes
            </h2>
            <TopNeighborhoodsChart data={stats?.topNeighborhoods ?? []} limit={10} />
            <ChartInsight chartType="topNeighborhoods" data={stats?.topNeighborhoods ?? []} />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Localização dos Acidentes
            </h2>
            <div className="h-80">
              <AccidentsMap />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
