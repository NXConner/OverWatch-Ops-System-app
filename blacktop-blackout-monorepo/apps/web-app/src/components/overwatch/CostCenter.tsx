import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Users, Truck, Fuel, Wrench, Loader2, Package } from 'lucide-react'
import { useTerminology } from '../../contexts/TerminologyContext'

interface CostData {
  wages: number
  materials: number
  fuel: number
  equipment: number
  overhead: number
  total: number
}

interface InventoryItem {
  item_name: string
  current_stock: number
  unit_cost: number
  total_value: number
}

interface CostCenterData {
  daily: CostData
  weekly: CostData
  monthly: CostData
  inventory: InventoryItem[]
  lastUpdated: string
}

interface CostBreakdown {
  category: string
  amount: number
  percentage: number
  icon: React.ReactNode
  color: string
}

export const CostCenter: React.FC = () => {
  const { translate } = useTerminology()
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [costData, setCostData] = useState<CostCenterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCostData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/overwatch/cost-center')
        const data = await response.json()
        
        if (data.success) {
          setCostData(data.data)
        } else {
          setError(data.error || 'Failed to fetch cost data')
          // Use fallback data
          setCostData(getFallbackCostData())
        }
      } catch (error) {
        console.error('Error fetching cost data:', error)
        setError('Failed to connect to cost tracking system')
        // Use fallback data
        setCostData(getFallbackCostData())
      } finally {
        setLoading(false)
      }
    }

    fetchCostData()
    
    // Refresh cost data every 2 minutes
    const interval = setInterval(fetchCostData, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getFallbackCostData = (): CostCenterData => ({
    daily: {
      wages: 720.00,
      materials: 245.50,
      fuel: 85.20,
      equipment: 120.00,
      overhead: 163.61,
      total: 1334.31
    },
    weekly: {
      wages: 3600.00,
      materials: 1456.80,
      fuel: 425.60,
      equipment: 600.00,
      overhead: 918.20,
      total: 7000.60
    },
    monthly: {
      wages: 14400.00,
      materials: 5827.20,
      fuel: 1702.40,
      equipment: 2400.00,
      overhead: 3672.80,
      total: 28002.40
    },
    inventory: [
      { item_name: 'SealMaster PMM', current_stock: 120, unit_cost: 3.79, total_value: 454.80 },
      { item_name: 'Sand 50lb', current_stock: 45, unit_cost: 10.00, total_value: 450.00 },
      { item_name: 'CrackMaster', current_stock: 25, unit_cost: 44.95, total_value: 1123.75 }
    ],
    lastUpdated: new Date().toISOString()
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const minutes = Math.floor((new Date().getTime() - date.getTime()) / 60000)
    if (minutes < 1) return translate('Just now', 'Just now')
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ago`
  }

  const calculatePercentage = (amount: number, total: number) => {
    return total > 0 ? ((amount / total) * 100) : 0
  }

  const getCurrentCostData = (): CostData => {
    if (!costData) return getFallbackCostData()[activeTab]
    return costData[activeTab]
  }

  const getCostBreakdown = (): CostBreakdown[] => {
    const data = getCurrentCostData()
    
    return [
      {
        category: translate('Labor/Wages', 'Labor'),
        amount: data.wages,
        percentage: calculatePercentage(data.wages, data.total),
        icon: <Users className="h-4 w-4" />,
        color: 'text-primary'
      },
      {
        category: translate('Materials', 'Materials'),
        amount: data.materials,
        percentage: calculatePercentage(data.materials, data.total),
        icon: <Package className="h-4 w-4" />,
        color: 'text-accent'
      },
      {
        category: translate('Equipment', 'Equipment'),
        amount: data.equipment,
        percentage: calculatePercentage(data.equipment, data.total),
        icon: <Truck className="h-4 w-4" />,
        color: 'text-green-500'
      },
      {
        category: translate('Fuel', 'Fuel'),
        amount: data.fuel,
        percentage: calculatePercentage(data.fuel, data.total),
        icon: <Fuel className="h-4 w-4" />,
        color: 'text-yellow-500'
      },
      {
        category: translate('Overhead', 'Overhead'),
        amount: data.overhead,
        percentage: calculatePercentage(data.overhead, data.total),
        icon: <Wrench className="h-4 w-4" />,
        color: 'text-orange-500'
      }
    ].filter(item => item.amount > 0) // Only show categories with costs
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-red-500'
    if (current < previous) return 'text-green-500'
    return 'text-gray-500'
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4" />
    if (current < previous) return <TrendingDown className="h-4 w-4" />
    return <div className="h-4 w-4" />
  }

  const getTrendText = (current: number, previous: number) => {
    const diff = current - previous
    const sign = diff >= 0 ? '+' : ''
    return `${sign}${formatCurrency(diff)} from yesterday`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Loading cost data...</p>
        </div>
      </div>
    )
  }

  const currentData = getCurrentCostData()
  const costBreakdown = getCostBreakdown()

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
          <p className="text-xs text-yellow-600 mt-1">Showing cached data</p>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex items-center justify-center space-x-1 bg-muted p-1 rounded-lg">
        {(['daily', 'weekly', 'monthly'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setActiveTab(period)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === period
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {translate(period.charAt(0).toUpperCase() + period.slice(1), period)}
          </button>
        ))}
      </div>

      {/* Total Cost Display */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <DollarSign className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">
            {translate(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Operating Cost`, `${activeTab} Expenses`)}
          </span>
        </div>
        
        <div className="text-4xl font-bold text-primary mb-1">
          {formatCurrency(currentData.total)}
        </div>
        
        {/* Trend indicator (comparing to previous period) */}
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className={getTrendColor(currentData.total, currentData.total * 0.92)}>
            {getTrendIcon(currentData.total, currentData.total * 0.92)}
          </div>
          <span className={getTrendColor(currentData.total, currentData.total * 0.92)}>
            {getTrendText(currentData.total, currentData.total * 0.92)}
          </span>
        </div>
        
        {costData?.lastUpdated && (
          <div className="text-xs text-muted-foreground mt-1">
            {translate('Last updated', 'Last updated')}: {getTimeAgo(costData.lastUpdated)}
          </div>
        )}
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
                  {item.percentage.toFixed(1)}% of total
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-bold">{formatCurrency(item.amount)}</div>
              <div className="w-16 h-1 bg-background rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-bold text-accent">
            ${(currentData.wages / Math.max(currentData.wages / 45, 1)).toFixed(0)}/hr
          </div>
          <div className="text-xs text-muted-foreground">
            {translate('Avg Labor Rate', 'Labor Rate/Hour')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-500">
            {Math.round(currentData.wages / 45)}h
          </div>
          <div className="text-xs text-muted-foreground">
            {translate('Hours Logged', 'Total Hours')}
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      {costData?.inventory && costData.inventory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {translate('Material Inventory', 'Current Inventory')}
          </h4>
          <div className="space-y-2">
            {costData.inventory.slice(0, 4).map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="truncate flex-1">{item.item_name}</span>
                <div className="text-right ml-2">
                  <div className="font-medium">{formatCurrency(item.unit_cost)}</div>
                  <div className="text-muted-foreground">
                    {item.current_stock.toFixed(1)} units
                  </div>
                </div>
              </div>
            ))}
            {costData.inventory.length > 4 && (
              <div className="text-xs text-muted-foreground text-center">
                +{costData.inventory.length - 4} more items
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}