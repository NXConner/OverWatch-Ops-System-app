import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'

interface StatusIndicatorProps {
  connected: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  connected, 
  label,
  size = 'sm' 
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }

  return (
    <div className="flex items-center space-x-1">
      {connected ? (
        <Wifi className={`${sizeClasses[size]} text-green-500`} />
      ) : (
        <WifiOff className={`${sizeClasses[size]} text-red-500`} />
      )}
      {label && (
        <span className={`text-${size === 'sm' ? 'xs' : 'sm'} ${connected ? 'text-green-600' : 'text-red-600'}`}>
          {label}
        </span>
      )}
    </div>
  )
}