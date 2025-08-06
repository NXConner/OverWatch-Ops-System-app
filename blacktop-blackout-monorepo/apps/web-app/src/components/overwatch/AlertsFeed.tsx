import React from 'react'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'

export const AlertsFeed: React.FC = () => {
  const alerts = [
    { type: 'warning', message: 'Weather alert: Rain possible in 2 hours', time: '2 min ago' },
    { type: 'info', message: 'Pavement scan completed at Job Site A', time: '15 min ago' },
    { type: 'success', message: 'All vehicles within designated zones', time: '1 hour ago' }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
          {getIcon(alert.type)}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{alert.message}</p>
            <p className="text-xs text-muted-foreground">{alert.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}