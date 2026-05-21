import axios from 'axios'
import { Accident } from '../types/accident'
import { Statistics } from '../types/statistics'
import { ActiveFilters } from '../components/FilterPanel'
import { ForecastResponse, SeverityResponse, HeatmapResponse } from '../types/ml'

const client = axios.create({ baseURL: '/api' })

function mlParams(filters?: Partial<ActiveFilters>): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (filters?.year     != null) params.year     = filters.year
  if (filters?.district != null) params.district = filters.district
  if (filters?.type     != null) params.type     = filters.type
  return params
}

export const api = {
  getStatistics: async (filters?: Partial<ActiveFilters>): Promise<Statistics> => {
    const params = mlParams(filters)
    const { data } = await client.get<Statistics>('/statistics', { params })
    return data
  },

  getAccidents: async (params?: {
    district?:     string
    neighborhood?: string
    type?:         string
    year?:         number
    month?:        number
  }): Promise<Accident[]> => {
    const { data } = await client.get<Accident[]>('/accidents', { params })
    return data
  },

  getAccident: async (id: number): Promise<Accident> => {
    const { data } = await client.get<Accident>(`/accidents/${id}`)
    return data
  },

  getMapData: async (): Promise<Accident[]> => {
    const { data } = await client.get<Accident[]>('/map')
    return data
  },

  getForecast: async (filters?: Partial<ActiveFilters>): Promise<ForecastResponse> => {
    const params = { ...mlParams(filters), periods: 6 }
    const { data } = await client.get<ForecastResponse>('/ml/forecast', { params })
    return data
  },

  getSeverity: async (filters?: Partial<ActiveFilters>): Promise<SeverityResponse> => {
    const params = mlParams(filters)
    const { data } = await client.get<SeverityResponse>('/ml/severity', { params })
    return data
  },

  getHeatmap: async (filters?: Partial<ActiveFilters>): Promise<HeatmapResponse> => {
    const params = mlParams(filters)
    const { data } = await client.get<HeatmapResponse>('/ml/heatmap', { params })
    return data
  },
}
