export interface ForecastPoint {
  year: number
  month: number
  total: number
  lower?: number
  upper?: number
}

export interface ForecastResponse {
  historical: ForecastPoint[]
  forecast: ForecastPoint[]
  message?: string
}

export interface RiskByHour {
  hour: number
  avgRisk: number
}

export interface FeatureImportance {
  feature: string
  importance: number
}

export interface SeverityResponse {
  riskByHour: RiskByHour[]
  featureImportances: FeatureImportance[]
  totalAccidents: number
  totalFatals: number
  fatalPct: number
}

export interface HeatmapCell {
  weekday: number
  weekdayName: string
  hour: number
  total: number
  intensity: number
}

export interface HeatmapResponse {
  cells: HeatmapCell[]
  maxTotal: number
}
