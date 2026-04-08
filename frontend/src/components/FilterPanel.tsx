import { Statistics } from '../types/statistics'

export interface ActiveFilters {
  year:     number | null
  district: string | null
  type:     string | null
}

export const EMPTY_FILTERS: ActiveFilters = { year: null, district: null, type: null }

interface Props {
  /** Unfiltered statistics – used to build the dropdown options */
  baseStats: Statistics | null
  filters:   ActiveFilters
  loading:   boolean
  onChange:  (f: ActiveFilters) => void
}

const selectClass =
  'text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 cursor-pointer'

export function FilterPanel({ baseStats, filters, loading, onChange }: Props) {
  const years     = (baseStats?.byYear     ?? []).map(y => y.year).sort((a, b) => a - b)
  const districts = (baseStats?.byDistrict ?? []).map(d => d.district).sort()
  const types     = (baseStats?.byType     ?? []).map(t => t.type).sort()

  const hasFilter = filters.year !== null || filters.district !== null || filters.type !== null

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Filtros
      </span>

      {/* ── Ano ──────────────────────────────────────────────────────── */}
      <select
        className={selectClass}
        disabled={loading}
        value={filters.year ?? ''}
        onChange={e =>
          onChange({ ...filters, year: e.target.value ? parseInt(e.target.value) : null })
        }
      >
        <option value="">Todos os anos</option>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* ── Regional ─────────────────────────────────────────────────── */}
      <select
        className={selectClass}
        disabled={loading}
        value={filters.district ?? ''}
        onChange={e =>
          onChange({ ...filters, district: e.target.value || null })
        }
      >
        <option value="">Todas as regionais</option>
        {districts.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* ── Tipo de acidente ─────────────────────────────────────────── */}
      <select
        className={selectClass}
        disabled={loading}
        value={filters.type ?? ''}
        onChange={e =>
          onChange({ ...filters, type: e.target.value || null })
        }
      >
        <option value="">Todos os tipos</option>
        {types.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* ── Limpar ───────────────────────────────────────────────────── */}
      {hasFilter && (
        <button
          className="text-sm text-blue-600 hover:text-blue-800 font-medium underline disabled:opacity-50"
          disabled={loading}
          onClick={() => onChange(EMPTY_FILTERS)}
        >
          Limpar filtros
        </button>
      )}

      {/* ── Indicador de carregamento ────────────────────────────────── */}
      {loading && (
        <span className="text-sm text-gray-400 italic">atualizando…</span>
      )}
    </div>
  )
}
