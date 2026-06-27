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
import { ForecastChart } from './components/ForecastChart'
import { SeverityChart } from './components/SeverityChart'
import { HeatmapChart } from './components/HeatmapChart'
import { api } from './services/api'
import { Statistics } from './types/statistics'
import { ForecastResponse, SeverityResponse, HeatmapResponse } from './types/ml'

export default function App() {
  const [baseStats, setBaseStats] = useState<Statistics | null>(null)
  const [stats, setStats] = useState<Statistics | null>(null)
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [forecast, setForecast] = useState<ForecastResponse | null>(null)
  const [severity, setSeverity] = useState<SeverityResponse | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapResponse | null>(null)
  const [mlLoading, setMlLoading] = useState(false)
  const [mlError, setMlError] = useState(false)

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

    Promise.all([api.getForecast(), api.getSeverity(), api.getHeatmap()])
      .then(([f, s, h]) => {
        setForecast(f)
        setSeverity(s)
        setHeatmap(h)
      })
      .catch(() => setMlError(true))
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setFiltering(true)
    setMlLoading(true)

    Promise.all([
      api.getStatistics(filters),
      api.getForecast(filters),
      api.getSeverity(filters),
      api.getHeatmap(filters),
    ])
      .then(([statsData, f, s, h]) => {
        setStats(statsData)
        setForecast(f)
        setSeverity(s)
        setHeatmap(h)
        setMlError(false)
      })
      .catch(console.error)
      .finally(() => {
        setFiltering(false)
        setMlLoading(false)
      })
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
            <h2 className="text-base font-semibold text-gray-700 mb-4">Acidentes por Ano</h2>
            <AccidentsByYearChart data={stats?.byYear ?? []} />
            <ChartInsight chartType="byYear" data={stats?.byYear ?? []} />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Acidentes por Hora do Dia</h2>
            <AccidentsByHourChart data={stats?.byHour ?? []} />
            <ChartInsight chartType="byHour" data={stats?.byHour ?? []} />
          </div>
        </section>
        {}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Acidentes por Dia da Semana</h2>
            <AccidentsByWeekdayChart data={stats?.byWeekday ?? []} />
            <ChartInsight chartType="byWeekday" data={stats?.byWeekday ?? []} />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Acidentes por Tipo</h2>
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

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200" />
          <div className="mx-4 flex items-center gap-2 shrink-0">
            <span className="text-base font-bold text-gray-600 uppercase tracking-widest">
              Análise Preditiva &amp; Estatística
            </span>
          </div>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        <p className="text-sm text-gray-400 -mt-4 text-center">
          Modelos de Machine Learning aplicados ao recorte selecionado pelos filtros acima
        </p>

        {mlError && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
            ⚠️ Não foi possível conectar ao serviço de ML. Verifique se o microserviço Python
            está rodando na porta 8000:{' '}
            <code className="font-mono bg-amber-100 px-1 rounded">
              cd ml-service &amp;&amp; uvicorn main:app --reload
            </code>
          </div>
        )}

        {!mlError && (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-semibold text-gray-700">
                    Previsão de Acidentes
                  </h2>
                  <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                    Naive Sazonal
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Últimos 24 meses do histórico com projeção para os próximos 6 — banda indica ±1 desvio padrão histórico do mesmo mês
                </p>
                {mlLoading ? (
                  <div className="flex items-center justify-center h-48 text-gray-300 text-sm">Calculando…</div>
                ) : forecast ? (
                  <ForecastChart data={forecast} />
                ) : null}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-semibold text-gray-700">
                    Análise de Severidade
                  </h2>
                  <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                    Random Forest
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Risco de fatalidade por hora e principais fatores de influência
                </p>
                {mlLoading ? (
                  <div className="flex items-center justify-center h-48 text-gray-300 text-sm">Calculando…</div>
                ) : severity ? (
                  <SeverityChart data={severity} />
                ) : null}
              </div>
            </section>

            <section>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-semibold text-gray-700">
                    Mapa de Calor — Hora × Dia da Semana
                  </h2>
                  <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                    Concentração Temporal
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Distribuição de acidentes por hora do dia e dia da semana — cores mais escuras indicam maior concentração
                </p>
                {mlLoading ? (
                  <div className="flex items-center justify-center h-32 text-gray-300 text-sm">Calculando…</div>
                ) : heatmap ? (
                  <HeatmapChart data={heatmap} />
                ) : null}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
