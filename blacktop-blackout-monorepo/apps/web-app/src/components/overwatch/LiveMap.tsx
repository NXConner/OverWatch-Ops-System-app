import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { LatLngExpression, Icon } from 'leaflet'
import { Users, Truck, MapPin, Navigation } from 'lucide-react'
import { useTerminology } from '../../contexts/TerminologyContext'

// Fix for default markers in react-leaflet
import 'leaflet/dist/leaflet.css'

// Mock data for locations
const mockLocations = {
  personnel: [
    {
      id: '1',
      name: 'John Smith',
      position: [36.5962, -80.2741] as LatLngExpression,
      status: 'active',
      activity: 'sealcoating',
      lastUpdate: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Mike Johnson',
      position: [36.5965, -80.2745] as LatLngExpression,
      status: 'active',
      activity: 'prep_work',
      lastUpdate: new Date().toISOString()
    }
  ],
  vehicles: [
    {
      id: '1',
      name: '1978 Chevy C30',
      position: [36.5963, -80.2742] as LatLngExpression,
      status: 'active',
      driver: 'John Smith',
      fuel: 85,
      lastUpdate: new Date().toISOString()
    },
    {
      id: '2',
      name: '1995 Dodge Dakota',
      position: [36.5961, -80.2740] as LatLngExpression,
      status: 'parked',
      driver: null,
      fuel: 92,
      lastUpdate: new Date().toISOString()
    }
  ],
  geofences: [
    {
      id: '1',
      name: 'Main Office',
      center: [36.5962, -80.2741] as LatLngExpression,
      radius: 100,
      type: 'office'
    },
    {
      id: '2',
      name: 'Current Job Site',
      center: [36.5965, -80.2745] as LatLngExpression,
      radius: 50,
      type: 'work_site'
    }
  ]
}

// Custom icon creation
const createCustomIcon = (color: string, size: number = 25) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    `)}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  })
}

export const LiveMap: React.FC = () => {
  const { translate } = useTerminology()
  const [selectedMapType, setSelectedMapType] = useState('openstreetmap')

  const mapTypes = [
    { key: 'openstreetmap', name: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    { key: 'satellite', name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    { key: 'terrain', name: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' }
  ]

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'sealcoating':
        return '🛣️'
      case 'prep_work':
        return '🔧'
      case 'crack_filling':
        return '🔨'
      default:
        return '👷'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#22c55e' // green
      case 'parked':
        return '#eab308' // yellow
      case 'offline':
        return '#ef4444' // red
      default:
        return '#6b7280' // gray
    }
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select
            value={selectedMapType}
            onChange={(e) => setSelectedMapType(e.target.value)}
            className="px-3 py-1 bg-muted border border-border rounded-md text-sm"
          >
            {mapTypes.map(type => (
              <option key={type.key} value={type.key}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{translate('Active', 'Active')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>{translate('Standby', 'Parked')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>{translate('Offline', 'Offline')}</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container h-96">
        <MapContainer
          center={[36.5962, -80.2741]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            url={mapTypes.find(t => t.key === selectedMapType)?.url || mapTypes[0].url}
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Geofences */}
          {mockLocations.geofences.map(fence => (
            <Circle
              key={fence.id}
              center={fence.center}
              radius={fence.radius}
              pathOptions={{
                color: fence.type === 'office' ? '#1e90ff' : '#ff8c00',
                fillColor: fence.type === 'office' ? '#1e90ff' : '#ff8c00',
                fillOpacity: 0.1,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{fence.name}</div>
                  <div className="text-muted-foreground">
                    {translate('Zone', 'Area')}: {fence.type}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Personnel Markers */}
          {mockLocations.personnel.map(person => (
            <Marker
              key={person.id}
              position={person.position}
              icon={createCustomIcon(getStatusColor(person.status))}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <div className="font-semibold flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{person.name}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {translate('Status', 'Status')}: {person.status}
                  </div>
                  <div className="text-muted-foreground">
                    {translate('Activity', 'Activity')}: {getActivityIcon(person.activity)} {person.activity}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {translate('Last Update', 'Last Update')}: {new Date(person.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Vehicle Markers */}
          {mockLocations.vehicles.map(vehicle => (
            <Marker
              key={vehicle.id}
              position={vehicle.position}
              icon={createCustomIcon(getStatusColor(vehicle.status), 30)}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <div className="font-semibold flex items-center space-x-1">
                    <Truck className="h-3 w-3" />
                    <span>{vehicle.name}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {translate('Status', 'Status')}: {vehicle.status}
                  </div>
                  {vehicle.driver && (
                    <div className="text-muted-foreground">
                      {translate('Operator', 'Driver')}: {vehicle.driver}
                    </div>
                  )}
                  <div className="text-muted-foreground">
                    {translate('Fuel', 'Fuel')}: {vehicle.fuel}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {translate('Last Update', 'Last Update')}: {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-2 bg-muted rounded-lg">
          <div className="text-lg font-bold text-primary">{mockLocations.personnel.length}</div>
          <div className="text-xs text-muted-foreground">
            {translate('Personnel', 'Employees')}
          </div>
        </div>
        <div className="p-2 bg-muted rounded-lg">
          <div className="text-lg font-bold text-accent">{mockLocations.vehicles.length}</div>
          <div className="text-xs text-muted-foreground">
            {translate('Assets', 'Vehicles')}
          </div>
        </div>
        <div className="p-2 bg-muted rounded-lg">
          <div className="text-lg font-bold text-green-500">
            {mockLocations.personnel.filter(p => p.status === 'active').length}
          </div>
          <div className="text-xs text-muted-foreground">
            {translate('Active', 'Active')}
          </div>
        </div>
        <div className="p-2 bg-muted rounded-lg">
          <div className="text-lg font-bold text-yellow-500">
            {mockLocations.geofences.length}
          </div>
          <div className="text-xs text-muted-foreground">
            {translate('Zones', 'Areas')}
          </div>
        </div>
      </div>
    </div>
  )
}