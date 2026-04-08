import { useEffect, useRef, useState } from 'react'
import { StatisticsCard } from './components/StatisticsCard'
import { AccidentsByYearChart } from './components/AccidentsByYearChart'
import { AccidentsByHourChart } from './components/AccidentsByHourChart'
import { AccidentsByTypeChart } from './components/AccidentsByTypeChart'
import { AccidentsByWeekdayChart } from './components/AccidentsByWeekdayChart'
import { TopNeighborhoodsChart } from './components/TopNeighborhoodsChart'
import { AccidentsMap } from './components/AccidentsMap'
import { FilterPanel, ActiveFilters, EMPTY_FILTERS } from './components/FilterPanel'
import { api } from './services/api'
import { Statistics } from './types/statistics'

export default function App() {
  // Unfiltered statistics – used only to build the filter option dropdowns
  const [baseStats, setBaseStats] = useState<Statistics | null>(null)

  // Currently displayed statistics (may be filtered)
  const [stats, setStats] = useState<Statistics | null>(null)

  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS)

  // true = initial full-page load; false = background refresh on filter change
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Skip the filter effect on the very first render (initial data already loaded)
  const isFirstRender = useRef(true)

  // ── Initial load ────────────────────────────────────────────────────────────
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

  // ── Re-fetch when filters change ────────────────────────────────────────────
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

  // ── Loading / error states ───────────────────────────────────────────────────
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
      {/* ── Header ──────────────────────────────────────────────────────── */}
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
        {/* ── Filtros ───────────────────────────────────────────────────── */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-3">
          <FilterPanel
            baseStats={baseStats}
            filters={filters}
            loading={filtering}
            onChange={setFilters}
          />
        </section>

        {/* ── KPIs ──────────────────────────────────────────────────────── */}
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

        {/* ── Linha 1: Por ano + Por hora do dia ────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Acidentes por Ano
            </h2>
            <AccidentsByYearChart data={stats?.byYear ?? []} />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Acidentes por Hora do Dia
            </h2>
            <AccidentsByHourChart data={stats?.byHour ?? []} />
          </div>
        </section>

        {/* ── Linha 2: Por dia da semana + Por tipo ─────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Acidentes por Dia da Semana
            </h2>
            <AccidentsByWeekdayChart data={stats?.byWeekday ?? []} />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Acidentes por Tipo
            </h2>
            <AccidentsByTypeChart data={stats?.byType ?? []} />
          </div>
        </section>

        {/* ── Linha 3: Top bairros + Mapa ───────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Top 10 Bairros com Mais Acidentes
            </h2>
            <TopNeighborhoodsChart data={stats?.topNeighborhoods ?? []} limit={10} />
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
