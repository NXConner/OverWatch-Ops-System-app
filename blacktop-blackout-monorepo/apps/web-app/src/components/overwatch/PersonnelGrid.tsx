import React from 'react'
import { Users, Clock, MapPin } from 'lucide-react'
import { useTerminology } from '../../contexts/TerminologyContext'

export const PersonnelGrid: React.FC = () => {
  const { translate } = useTerminology()

  const mockPersonnel = [
    { id: '1', name: 'John Smith', status: 'active', location: 'Job Site A', hours: 6.5 },
    { id: '2', name: 'Mike Johnson', status: 'active', location: 'Job Site A', hours: 6.2 },
    { id: '3', name: 'Sarah Wilson', status: 'standby', location: 'Office', hours: 4.0 },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {mockPersonnel.map(person => (
        <div key={person.id} className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">{person.name}</div>
            <div className={`w-2 h-2 rounded-full ${person.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          </div>
          <div className="text-sm text-muted-foreground flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{person.location}</span>
          </div>
          <div className="text-sm text-muted-foreground flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{person.hours}h {translate('logged', 'worked')}</span>
          </div>
        </div>
      ))}
    </div>
  )
}