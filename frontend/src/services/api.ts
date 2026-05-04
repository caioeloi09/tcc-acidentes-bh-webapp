import axios from 'axios'
import { Accident } from '../types/accident'
import { Statistics } from '../types/statistics'
import { ActiveFilters } from '../components/FilterPanel'

const client = axios.create({ baseURL: '/api' })

export const api = {
  /**
   * Fetches aggregated statistics.
   * Pass an ActiveFilters object to narrow the dataset on the server side.
   */
  getStatistics: async (filters?: Partial<ActiveFilters>): Promise<Statistics> => {
    const params: Record<string, string | number> = {}
    if (filters?.year     != null) params.year     = filters.year
    if (filters?.district != null) params.district = filters.district
    if (filters?.type     != null) params.type     = filters.type

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
}
