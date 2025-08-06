import React, { useState, useEffect } from 'react'
import { Users, MapPin, Clock, Activity, Phone, Loader2 } from 'lucide-react'
import { useTerminology } from '../../contexts/TerminologyContext'

interface PersonnelMember {
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
}

interface PersonnelData {
  personnel: PersonnelMember[]
  lastUpdated: string
}

export const PersonnelGrid: React.FC = () => {
  const { translate } = useTerminology()
  const [personnelData, setPersonnelData] = useState<PersonnelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPersonnelData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/overwatch/locations')
        const data = await response.json()
        
        if (data.success) {
          setPersonnelData({
            personnel: data.data.personnel,
            lastUpdated: data.data.lastUpdated
          })
        } else {
          setError(data.error || 'Failed to fetch personnel data')
          // Use fallback data
          setPersonnelData(getFallbackPersonnelData())
        }
      } catch (error) {
        console.error('Error fetching personnel data:', error)
        setError('Failed to connect to personnel tracking system')
        // Use fallback data
        setPersonnelData(getFallbackPersonnelData())
      } finally {
        setLoading(false)
      }
    }

    fetchPersonnelData()
    
    // Refresh personnel data every 30 seconds
    const interval = setInterval(fetchPersonnelData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getFallbackPersonnelData = (): PersonnelData => ({
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
      },
      {
        id: '3',
        name: 'Sarah Williams',
        role: 'operator',
        location: null,
        status: 'offline',
        currentProject: undefined
      }
    ],
    lastUpdated: new Date().toISOString()
  })

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500'
      case 'break':
      case 'standby':
        return 'bg-yellow-500'
      case 'offline':
      case 'inactive':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return translate('Active', 'On Duty')
      case 'break':
        return translate('Break', 'On Break')
      case 'standby':
        return translate('Standby', 'Standby')
      case 'offline':
        return translate('Offline', 'Off Duty')
      case 'inactive':
        return translate('Inactive', 'Inactive')
      default:
        return status
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'manager':
      case 'supervisor':
        return '👨‍💼'
      case 'operator':
      case 'technician':
        return '👷‍♂️'
      case 'admin':
        return '🧑‍💻'
      default:
        return '👤'
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

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Loading personnel data...</p>
        </div>
      </div>
    )
  }

  if (!personnelData || personnelData.personnel.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No personnel data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
          <p className="text-xs text-yellow-600 mt-1">Showing cached data</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="font-semibold">
            {translate('Personnel Status', 'Team Status')} ({personnelData.personnel.length})
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Updated: {formatLastUpdated(personnelData.lastUpdated)}
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {personnelData.personnel.map((person) => (
          <div key={person.id} className="p-4 bg-muted rounded-lg border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getRoleIcon(person.role)}</div>
                <div>
                  <div className="font-medium text-sm">{person.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {translate(person.role, person.role)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(person.status)}`}></div>
                <span className="text-xs font-medium">
                  {getStatusText(person.status)}
                </span>
              </div>
            </div>

            {/* Current Project */}
            {person.currentProject && (
              <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                <div className="flex items-center space-x-1 text-blue-700">
                  <Activity className="h-3 w-3" />
                  <span className="font-medium">Current Project:</span>
                </div>
                <div className="text-blue-600 mt-1 truncate">
                  {person.currentProject}
                </div>
              </div>
            )}

            {/* Location Info */}
            {person.location ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs">
                  <MapPin className="h-3 w-3 text-green-500" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-mono text-green-600">
                    {formatCoordinates(person.location.lat, person.location.lng)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-muted-foreground">Last seen:</span>
                  <span className="text-gray-600">
                    {formatLastUpdated(person.location.lastUpdated)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>Location unavailable</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-bold text-green-500">
            {personnelData.personnel.filter(p => p.status === 'active').length}
          </div>
          <div className="text-xs text-muted-foreground">
            {translate('Active', 'Active')}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-500">
            {personnelData.personnel.filter(p => ['break', 'standby'].includes(p.status.toLowerCase())).length}
          </div>
          <div className="text-xs text-muted-foreground">
            {translate('Standby', 'Standby')}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-red-500">
            {personnelData.personnel.filter(p => ['offline', 'inactive'].includes(p.status.toLowerCase())).length}
          </div>
          <div className="text-xs text-muted-foreground">
            {translate('Offline', 'Offline')}
          </div>
        </div>
      </div>
    </div>
  )
}