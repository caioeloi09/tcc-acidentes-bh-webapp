import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { api } from '../services/api'
import { Accident } from '../types/accident'

// BH city center coordinates
const BH_CENTER: [number, number] = [-19.9167, -43.9345]

export function AccidentsMap() {
  const [accidents, setAccidents] = useState<Accident[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load a sample of accidents with coordinates for the map
    api.getMapData()
      .then((data) => setAccidents(data.slice(0, 3000))) // limit for performance
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading map...
      </div>
    )
  }

  return (
    <MapContainer
      center={BH_CENTER}
      zoom={11}
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {accidents.map((a) =>
        a.latitude && a.longitude ? (
          <CircleMarker
            key={a.id}
            center={[a.latitude, a.longitude]}
            radius={3}
            pathOptions={{
              color: a.isFatal ? '#ef4444' : '#3b82f6',
              fillColor: a.isFatal ? '#ef4444' : '#3b82f6',
              fillOpacity: 0.6,
              weight: 0,
            }}
          >
            <Popup>
              <strong>{a.accidentType}</strong>
              <br />
              {a.neighborhood} · {a.district}
              <br />
              {a.dateTime?.slice(0, 10)}
              {a.isFatal ? <><br /><span style={{ color: '#ef4444' }}>⚠ Fatal</span></> : null}
            </Popup>
          </CircleMarker>
        ) : null,
      )}
    </MapContainer>
  )
}
