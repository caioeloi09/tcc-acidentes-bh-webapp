export interface Accident {
  id: number
  boletim: string | null
  dateTime: string | null
  year: number | null
  month: number | null
  hour: number | null
  weekday: number | null
  accidentType: string | null
  district: string | null
  neighborhood: string | null
  streetType: string | null
  streetName: string | null
  weather: string | null
  pavement: string | null
  isSignposted: number | null
  speedLimit: number | null
  isFatal: number
  upsValue: number | null
  upsDescription: string | null
  totalPeople: number
  totalFatalities: number
  totalVehicles: number
  latitude: number | null
  longitude: number | null
}
