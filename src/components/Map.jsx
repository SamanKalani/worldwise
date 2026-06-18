import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'

import styles from './Map.module.css'
import { useEffect, useState } from 'react'
import { useCities } from '../contexts/CitiesContext'
import { useGeolocation } from '../hooks/useGeolocation'
import { useUrlPosition } from '../hooks/useUrlPosition'
import Button from './Button'

function Map() {
  const { cities } = useCities()
  const [mapPosition, setMapPosition] = useState([40, 0])
  const {
    isLoading: isLoadingPosition,
    position: geolocationPosition,
    getPosition,
  } = useGeolocation()
  const [mapLat, mapLng] = useUrlPosition()

  // ۱. syncing map position with url
  useEffect(
    function () {
      if (mapLat && mapLng) setMapPosition([Number(mapLat), Number(mapLng)])
    },
    [mapLat, mapLng]
  )

  // ۲. syncing map position with geolocation
  useEffect(
    function () {
      if (geolocationPosition) {
        setMapPosition([geolocationPosition.lat, geolocationPosition.lng])
      }
    },
    [geolocationPosition]
  )

  return (
    <div className={styles.mapContainer}>
      {!geolocationPosition && (
        <Button type="position" onClick={getPosition}>
          {isLoadingPosition ? 'Loading...' : 'Use your position'}
        </Button>
      )}

      {/* main frame of the map */}
      <MapContainer center={mapPosition} zoom={6} scrollWheelZoom={true} className={styles.map}>
        {/* loaded images */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {/* using Marker on our cities */}
        {cities.map((city) => (
          <Marker position={[city.position.lat, city.position.lng]} key={city.id}>
            <Popup>
              <span>{city.emoji}</span> <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}

        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  )
}

// Component to programmatically update the map's center view.
// Note: Leaflet's MapContainer only sets the center during the initial mount.
// To make the map dynamic and responsive to state changes (like clicking a city),
// this component intercepts state updates and forces Leaflet to pan/fly to the new position.

function ChangeCenter({ position }) {
  const map = useMap() // Accesses Leaflet's internal map instance
  map.setView(position) // Programmatically updates the view to the new coordinates
  return null // This component doesn't render anything itself; it only interacts with the map instance
}

// Component to detect and handle click events anywhere on the map grid.
// Instead of tracking standard browser pixel clicks, it utilizes Leaflet's event system
// to capture geographic coordinates (latitude & longitude) and syncs them with the application
// state by redirecting the user to the city creation form via URL query parameters.
function DetectClick() {
  const navigate = useNavigate()

  useMapEvents({
    // Captures the geographic coordinates (e.latlng) and pushes them into the URL query string
    click: (e) => navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`),
  })
}

export default Map
