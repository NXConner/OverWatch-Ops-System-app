import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Users, Truck, Fuel, Wrench } from 'lucide-react'
import { useTerminology } from '../../contexts/TerminologyContext'

interface CostBreakdown {
  category: string
  amount: number
  percentage: number
  icon: React.ReactNode
  color: string
}

export const CostCenter: React.FC = () => {
  const { translate } = useTerminology()
  const [totalCost, setTotalCost] = useState(1247.50)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Mock real-time cost data based on business knowledge
  const costBreakdown: CostBreakdown[] = [
    {
      category: translate('Labor', 'Labor'),
      amount: 720.00, // 3 employees × 6 hours × $40/hour
      percentage: 57.7,
      icon: <Users className="h-4 w-4" />,
      color: 'text-primary'
    },
    {
      category: translate('Materials', 'Materials'),
      amount: 342.50, // Sealer, sand, etc.
      percentage: 27.5,
      icon: <Wrench className="h-4 w-4" />,
      color: 'text-accent'
    },
    {
      category: translate('Fuel', 'Fuel'),
      amount: 125.00, // Truck fuel + propane
      percentage: 10.0,
      icon: <Fuel className="h-4 w-4" />,
      color: 'text-yellow-500'
    },
    {
      category: translate('Equipment', 'Equipment'),
      amount: 60.00, // Equipment usage/maintenance
      percentage: 4.8,
      icon: <Truck className="h-4 w-4" />,
      color: 'text-green-500'
    }
  ]

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate small cost increments (labor time tracking)
      const increment = Math.random() * 2.5 // Random increment up to $2.50
      setTotalCost(prev => prev + increment)
      setLastUpdate(new Date())
    }, 15 * 60 * 1000) // Update every 15 minutes

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((new Date().getTime() - date.getTime()) / 60000)
    if (minutes < 1) return translate('Just now', 'Just now')
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ago`
  }

  return (
    <div className="space-y-6">
      {/* Total Cost Display */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <DollarSign className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">
            {translate('Daily Operating Cost', 'Today\'s Expenses')}
          </span>
        </div>
        
        <div className="text-4xl font-bold text-primary mb-1">
          {formatCurrency(totalCost)}
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span>+$127.50 from yesterday</span>
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          {translate('Last updated', 'Last updated')}: {getTimeAgo(lastUpdate)}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {translate('Cost Breakdown', 'Expense Categories')}
        </h3>
        
        {costBreakdown.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`${item.color}`}>
                {item.icon}
              </div>
              <div>
                <div className="text-sm font-medium">{item.category}</div>
                <div className="text-xs text-muted-foreground">
                  {item.percentage}% of total
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-bold">{formatCurrency(item.amount)}</div>
              <div className="w-16 h-1 bg-background rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color.replace('text-', 'bg-')}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-bold text-accent">$40-60</div>
          <div className="text-xs text-muted-foreground">
            {translate('Hourly Rate', 'Labor Rate/Hour')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-500">18</div>
          <div className="text-xs text-muted-foreground">
            {translate('Hours Logged', 'Total Hours')}
          </div>
        </div>
      </div>

      {/* Material Costs (SealMaster prices) */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {translate('Material Costs', 'Current Material Prices')}
        </h4>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>PMM Sealer Concentrate</span>
            <span>$3.79/gal</span>
          </div>
          <div className="flex justify-between">
            <span>Sand (50lb bag)</span>
            <span>$10.00/bag</span>
          </div>
          <div className="flex justify-between">
            <span>CrackMaster LP</span>
            <span>$44.95/box</span>
          </div>
          <div className="flex justify-between">
            <span>Propane</span>
            <span>$10.00/tank</span>
          </div>
        </div>
      </div>
    </div>
  )
}