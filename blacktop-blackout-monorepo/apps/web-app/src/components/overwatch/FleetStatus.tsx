import React from 'react'
import { Truck, Fuel, Wrench } from 'lucide-react'

export const FleetStatus: React.FC = () => {
  const vehicles = [
    { name: '1978 Chevy C30', fuel: 85, status: 'active' },
    { name: '1995 Dodge Dakota', fuel: 92, status: 'parked' }
  ]

  return (
    <div className="space-y-3">
      {vehicles.map((vehicle, index) => (
        <div key={index} className="p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-accent" />
              <span className="font-medium text-sm">{vehicle.name}</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${vehicle.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          </div>
          <div className="flex items-center space-x-2">
            <Fuel className="h-3 w-3 text-muted-foreground" />
            <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${vehicle.fuel}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{vehicle.fuel}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}