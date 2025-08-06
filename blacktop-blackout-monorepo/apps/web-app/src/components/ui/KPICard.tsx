import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface KPICardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: string
  color?: string
  className?: string
}

export const KPICard: React.FC<KPICardProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  color = 'text-primary',
  className
}) => {
  const getTrendColor = (trend?: string) => {
    if (!trend) return ''
    if (trend.startsWith('+')) return 'text-green-500'
    if (trend.startsWith('-')) return 'text-red-500'
    return 'text-muted-foreground'
  }

  return (
    <div className={cn('kpi-card group', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Icon className={cn('h-5 w-5', color)} />
            <span className="kpi-label">{label}</span>
          </div>
          <div className="kpi-value">{value}</div>
          {trend && (
            <div className={cn('text-sm font-medium mt-1', getTrendColor(trend))}>
              {trend}
            </div>
          )}
        </div>
        
        {/* Glow effect indicator */}
        <div className="relative">
          <div className={cn(
            'w-3 h-3 rounded-full border-2 border-current opacity-50',
            color
          )} />
          <div className={cn(
            'absolute inset-0 w-3 h-3 rounded-full animate-pulse-glow',
            color.replace('text-', 'bg-')
          )} />
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
    </div>
  )
}