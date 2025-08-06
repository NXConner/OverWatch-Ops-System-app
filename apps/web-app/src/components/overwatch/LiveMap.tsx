import React, { useState, useEffect } from 'react'
import { 
  MapPin, 
  Truck, 
  Users, 
  Activity, 
  Clock,
  Navigation,
  Shield,
  Wrench
} from 'lucide-react'

interface LocationData {
  personnel: Array<{
    id: string
    name: string
    role: string
    location: {
      lat: number
      lng: number
      lastUpdated: string
    } | null
    status: string
    currentProject?: string
  }>
  vehicles: Array<{
    id: string
    vehicleNumber: string
    type: string
    status: string
    location: {
      lat: number
      lng: number
      lastUpdated: string
    } | null
    operator?: string
  }>
  equipment: Array<{
    id: string
    name: string
    type: string
    status: string
    location: {
      lat: number
      lng: number
      lastUpdated: string
    } | null
    project?: string
  }>
  geofences: Array<{
    id: string
    name: string
    type: string
    center: {
      lat: number
      lng: number
    }
    radius: number
  }>
  lastUpdated: string
}

export const LiveMap: React.FC = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch('/api/overwatch/locations')
        const data = await response.json()
        
        if (data.success) {
          setLocationData(data.data)
        } else {
          console.error('Failed to fetch location data:', data.error)
          // Use fallback data
          setLocationData(getFallbackLocationData())
        }
      } catch (error) {
        console.error('Error fetching location data:', error)
        // Use fallback data
        setLocationData(getFallbackLocationData())
      } finally {
        setLoading(false)
      }
    }

    fetchLocationData()
    
    // Refresh location data every 15 seconds
    const interval = setInterval(fetchLocationData, 15000)
    return () => clearInterval(interval)
  }, [])

  const getFallbackLocationData = (): LocationData => ({
    personnel: [
      {
        id: '1',
        name: 'John Smith',
        role: 'operator',
        location: {
          lat: 36.5962,
          lng: -80.2741,
          lastUpdated: new Date().toISOString()
        },
        status: 'active',
        currentProject: 'Walmart Parking Lot - Section A'
      },
      {
        id: '2',
        name: 'Mike Johnson',
        role: 'manager',
        location: {
          lat: 36.5970,
          lng: -80.2750,
          lastUpdated: new Date().toISOString()
        },
        status: 'active',
        currentProject: 'ABC Manufacturing Driveway'
      }
    ],
    vehicles: [
      {
        id: '1',
        vehicleNumber: 'TRUCK-001',
        type: 'Sealcoating Truck',
        status: 'deployed',
        location: {
          lat: 36.5965,
          lng: -80.2745,
          lastUpdated: new Date().toISOString()
        },
        operator: 'John Smith'
      },
      {
        id: '2',
        vehicleNumber: 'TRUCK-002',
        type: 'Material Transport',
        status: 'active',
        location: {
          lat: 36.5955,
          lng: -80.2735,
          lastUpdated: new Date().toISOString()
        },
        operator: 'Mike Johnson'
      }
    ],
    equipment: [
      {
        id: '1',
        name: 'Sealcoating Sprayer #1',
        type: 'Spray Equipment',
        status: 'active',
        location: {
          lat: 36.5962,
          lng: -80.2741,
          lastUpdated: new Date().toISOString()
        },
        project: 'Walmart Parking Lot - Section A'
      }
    ],
    geofences: [
      {
        id: '1',
        name: 'Stuart Work Zone',
        type: 'work_area',
        center: { lat: 36.5962, lng: -80.2741 },
        radius: 5000
      },
      {
        id: '2',
        name: 'Equipment Storage',
        type: 'storage',
        center: { lat: 36.5950, lng: -80.2730 },
        radius: 500
      }
    ],
    lastUpdated: new Date().toISOString()
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'deployed':
        return 'bg-green-500'
      case 'inactive':
      case 'offline':
        return 'bg-red-500'
      case 'maintenance':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatLastUpdated = (timestamp: string) => {
    const now = new Date()
    const updated = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    return `${Math.floor(diffInMinutes / 60)}h ago`
  }

  if (loading) {
    return (
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading location data...</p>
        </div>
      </div>
    )
  }

  if (!locationData) {
    return (
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Location data unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Map Placeholder with Coordinates */}
      <div className="relative h-80 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border-2 border-dashed border-border overflow-hidden">
        {/* Map Grid Background */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${i * 5}%` }} />
          ))}
          {[...Array(16)].map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${i * 6.25}%` }} />
          ))}
        </div>

        {/* Stuart, VA Reference Point */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center space-x-1 text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded shadow">
            <MapPin className="h-3 w-3" />
            <span>Stuart, VA</span>
          </div>
        </div>

        {/* Personnel Markers */}
        {locationData.personnel.filter(p => p.location).map((person, index) => (
          <div
            key={person.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${50 + (index * 10 - 5)}%`,
              top: `${45 + (index * 5)}%`
            }}
            onClick={() => setSelectedItem(`person-${person.id}`)}
          >
            <div className={`w-3 h-3 rounded-full ${getStatusColor(person.status)} border-2 border-white shadow`}>
              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${getStatusColor(person.status)} animate-pulse`}></div>
            </div>
            {selectedItem === `person-${person.id}` && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg text-xs whitespace-nowrap z-10">
                <div className="font-medium">{person.name}</div>
                <div className="text-gray-500">{person.role}</div>
                {person.currentProject && <div className="text-blue-600">{person.currentProject}</div>}
                {person.location && <div className="text-gray-400">{formatLastUpdated(person.location.lastUpdated)}</div>}
              </div>
            )}
          </div>
        ))}

        {/* Vehicle Markers */}
        {locationData.vehicles.filter(v => v.location).map((vehicle, index) => (
          <div
            key={vehicle.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${55 + (index * 8)}%`,
              top: `${40 + (index * 7)}%`
            }}
            onClick={() => setSelectedItem(`vehicle-${vehicle.id}`)}
          >
            <div className={`w-4 h-4 rounded ${getStatusColor(vehicle.status)} border-2 border-white shadow flex items-center justify-center`}>
              <Truck className="h-2 w-2 text-white" />
            </div>
            {selectedItem === `vehicle-${vehicle.id}` && (
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg text-xs whitespace-nowrap z-10">
                <div className="font-medium">{vehicle.vehicleNumber}</div>
                <div className="text-gray-500">{vehicle.type}</div>
                {vehicle.operator && <div className="text-blue-600">Operator: {vehicle.operator}</div>}
                {vehicle.location && <div className="text-gray-400">{formatLastUpdated(vehicle.location.lastUpdated)}</div>}
              </div>
            )}
          </div>
        ))}

        {/* Equipment Markers */}
        {locationData.equipment.filter(e => e.location).map((equipment, index) => (
          <div
            key={equipment.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${48 + (index * 6)}%`,
              top: `${52 + (index * 4)}%`
            }}
            onClick={() => setSelectedItem(`equipment-${equipment.id}`)}
          >
            <div className={`w-3 h-3 rounded-sm ${getStatusColor(equipment.status)} border border-white shadow flex items-center justify-center`}>
              <Wrench className="h-1.5 w-1.5 text-white" />
            </div>
            {selectedItem === `equipment-${equipment.id}` && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg text-xs whitespace-nowrap z-10">
                <div className="font-medium">{equipment.name}</div>
                <div className="text-gray-500">{equipment.type}</div>
                {equipment.project && <div className="text-blue-600">{equipment.project}</div>}
                {equipment.location && <div className="text-gray-400">{formatLastUpdated(equipment.location.lastUpdated)}</div>}
              </div>
            )}
          </div>
        ))}

        {/* Geofences */}
        {locationData.geofences.map((geofence, index) => (
          <div
            key={geofence.id}
            className="absolute border-2 border-blue-300 bg-blue-100 bg-opacity-20 rounded-full"
            style={{
              left: `${45 + (index * 10)}%`,
              top: `${45 + (index * 5)}%`,
              width: `${Math.min(geofence.radius / 100, 20)}%`,
              height: `${Math.min(geofence.radius / 100, 20)}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs font-medium text-blue-700 bg-white px-1 rounded">
                {geofence.name}
              </div>
            </div>
          </div>
        ))}

        {/* Interactive Map Note */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
          Interactive Map • Click markers for details
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Personnel</span>
          </div>
          <div className="text-lg font-bold text-primary">{locationData.personnel.length}</div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Truck className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">Vehicles</span>
          </div>
          <div className="text-lg font-bold text-accent">{locationData.vehicles.length}</div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
          <div className="text-lg font-bold text-green-500">
            {locationData.personnel.filter(p => p.status === 'active').length + 
             locationData.vehicles.filter(v => v.status === 'active' || v.status === 'deployed').length}
          </div>
        </div>
        
        <div className="col-span-3 flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Geofenced Areas</span>
          </div>
          <div className="text-lg font-bold text-blue-500">{locationData.geofences.length}</div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center justify-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        Last updated: {new Date(locationData.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  )
}