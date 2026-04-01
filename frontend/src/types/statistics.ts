export interface CountEntry {
  total: number
}

export interface DistrictCount extends CountEntry {
  district: string
}

export interface NeighborhoodCount extends CountEntry {
  neighborhood: string
}

export interface TypeCount extends CountEntry {
  type: string
}

export interface YearCount extends CountEntry {
  year: number
}

export interface HourCount extends CountEntry {
  hour: number
}

export interface WeekdayCount extends CountEntry {
  weekday: number
}

export interface Statistics {
  totalAccidents: number
  totalFatalities: number
  byDistrict: DistrictCount[]
  topNeighborhoods: NeighborhoodCount[]
  byType: TypeCount[]
  byYear: YearCount[]
  byHour: HourCount[]
  byWeekday: WeekdayCount[]
}
