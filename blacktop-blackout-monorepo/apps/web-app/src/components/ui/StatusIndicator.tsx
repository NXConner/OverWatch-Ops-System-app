import React from 'react'
import { cn } from '../../utils/cn'

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error'
  label?: string
  pulse?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = false,
  size = 'md',
  className
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'offline':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-600'
      default:
        return 'bg-gray-500'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2'
      case 'md':
        return 'w-3 h-3'
      case 'lg':
        return 'w-4 h-4'
      default:
        return 'w-3 h-3'
    }
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="relative">
        <div
          className={cn(
            'rounded-full border-2 border-background',
            getStatusColor(),
            getSizeClasses()
          )}
        />
        {pulse && status === 'online' && (
          <div
            className={cn(
              'absolute inset-0 rounded-full animate-pulse-glow',
              getStatusColor(),
              getSizeClasses()
            )}
          />
        )}
      </div>
      {label && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  )
}