import { useEffect, useState } from 'react'
import { StatisticsCard } from './components/StatisticsCard'
import { AccidentsByYearChart } from './components/AccidentsByYearChart'
import { AccidentsByHourChart } from './components/AccidentsByHourChart'
import { AccidentsByTypeChart } from './components/AccidentsByTypeChart'
import { AccidentsMap } from './components/AccidentsMap'
import { api } from './services/api'
import { Statistics } from './types/statistics'

export default function App() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getStatistics()
      .then(setStats)
      .catch(() => setError('Failed to load data. Make sure the backend is running on port 8080.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">
          BH Traffic Accidents Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Data from BHTrans · 2016 – 2023 · {stats?.totalAccidents.toLocaleString()} accidents
        </p>
      </header>

      <main className="p-6 space-y-6">
        {/* KPI cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatisticsCard
            label="Total Accidents"
            value={stats?.totalAccidents.toLocaleString() ?? '-'}
          />
          <StatisticsCard
            label="Fatal Accidents"
            value={stats?.totalFatalities.toLocaleString() ?? '-'}
            highlight
          />
          <StatisticsCard
            label="Districts"
            value={stats?.byDistrict.length.toLocaleString() ?? '-'}
          />
          <StatisticsCard
            label="Period"
            value="2016 – 2023"
          />
        </section>

        {/* Charts row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Accidents per Year</h2>
            <AccidentsByYearChart data={stats?.byYear ?? []} />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Accidents by Hour of Day</h2>
            <AccidentsByHourChart data={stats?.byHour ?? []} />
          </div>
        </section>

        {/* Type chart + map */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Accidents by Type</h2>
            <AccidentsByTypeChart data={stats?.byType ?? []} />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Accident Locations</h2>
            <div className="h-80">
              <AccidentsMap />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
