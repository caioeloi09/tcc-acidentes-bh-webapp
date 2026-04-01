import axios from 'axios'
import { Accident } from '../types/accident'
import { Statistics } from '../types/statistics'

const client = axios.create({ baseURL: '/api' })

export const api = {
  getStatistics: async (): Promise<Statistics> => {
    const { data } = await client.get<Statistics>('/statistics')
    return data
  },

  getAccidents: async (params?: {
    district?: string
    neighborhood?: string
    type?: string
    year?: number
    month?: number
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
