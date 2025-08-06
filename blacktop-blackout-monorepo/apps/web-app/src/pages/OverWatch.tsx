import React, { useState, useEffect } from 'react'
import { 
  MapPin, 
  DollarSign, 
  CloudRain, 
  Users, 
  Truck, 
  Wrench,
  Activity,
  AlertTriangle,
  Eye,
  Scan,
  Target,
  Radio,
  Clock,
  TrendingUp,
  Brain
} from 'lucide-react'
import { useTerminology } from '../contexts/TerminologyContext'
import { useSocket } from '../contexts/SocketContext'
import { LiveMap } from '../components/overwatch/LiveMap'
import { CostCenter } from '../components/overwatch/CostCenter'
import { WeatherWidget } from '../components/overwatch/WeatherWidget'
import { PersonnelGrid } from '../components/overwatch/PersonnelGrid'
import { FleetStatus } from '../components/overwatch/FleetStatus'
import { AlertsFeed } from '../components/overwatch/AlertsFeed'
import { PavementScanWidget } from '../components/overwatch/PavementScanWidget'
import { AIEstimatorWidget } from '../components/overwatch/AIEstimatorWidget'
import { KPICard } from '../components/ui/KPICard'
import { StatusIndicator } from '../components/ui/StatusIndicator'

interface DashboardKPIs {
  activeProjects: number
  operationsToday: number
  activePersonnel: number
  vehiclesDeployed: number
  dailyCosts: number
  activeAlerts: number
  completedScans: number
  defectsDetected: number
}

interface SystemAlert {
  id: string
  type: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
}

export const OverWatch: React.FC = () => {
  const { translate } = useTerminology()
  const { connected: socketConnected } = useSocket()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<{
    kpis: DashboardKPIs
    alerts: SystemAlert[]
    lastUpdated: string
  } | null>(null)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/overwatch/dashboard')
        const data = await response.json()
        
        if (data.success) {
          setDashboardData(data.data)
        } else {
          console.error('Failed to fetch dashboard data:', data.error)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading OverWatch-Ops Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-primary">
                {translate('OverWatch-Ops', 'Operations Center')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {translate('Real-time operational intelligence', 'Live operations monitoring')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-right space-y-1">
          <div className="text-2xl font-mono font-bold text-primary">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(currentTime)}
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <StatusIndicator connected={socketConnected} />
            <span className="text-muted-foreground">
              {socketConnected ? 
                translate('Systems Online', 'Connected') : 
                translate('Systems Offline', 'Disconnected')
              }
            </span>
          </div>
        </div>
      </div>

      {/* KPIs Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        <KPICard
          title={translate('Active Projects', 'Projects')}
          value={dashboardData?.kpis.activeProjects || 0}
          icon={Target}
          trend="stable"
        />
        <KPICard
          title={translate('Operations Today', 'Operations')}
          value={dashboardData?.kpis.operationsToday || 0}
          icon={Activity}
          trend="up"
        />
        <KPICard
          title={translate('Personnel Active', 'Personnel')}
          value={dashboardData?.kpis.activePersonnel || 0}
          icon={Users}
          trend="stable"
        />
        <KPICard
          title={translate('Vehicles Deployed', 'Vehicles')}
          value={dashboardData?.kpis.vehiclesDeployed || 0}
          icon={Truck}
          trend="stable"
        />
        <KPICard
          title={translate('Daily Costs', 'Costs')}
          value={`$${(dashboardData?.kpis.dailyCosts || 0).toFixed(2)}`}
          icon={DollarSign}
          trend="up"
        />
        <KPICard
          title={translate('Active Alerts', 'Alerts')}
          value={dashboardData?.kpis.activeAlerts || 0}
          icon={AlertTriangle}
          trend="stable"
          variant={dashboardData?.kpis.activeAlerts && dashboardData.kpis.activeAlerts > 0 ? 'warning' : 'default'}
        />
        <KPICard
          title={translate('Scans Completed', 'Scans')}
          value={dashboardData?.kpis.completedScans || 0}
          icon={Scan}
          trend="up"
        />
        <KPICard
          title={translate('Defects Detected', 'Defects')}
          value={dashboardData?.kpis.defectsDetected || 0}
          icon={Eye}
          trend="stable"
          variant={dashboardData?.kpis.defectsDetected && dashboardData.kpis.defectsDetected > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Map */}
        <div className="xl:col-span-2">
          <div className="card-enhanced p-6">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">
                {translate('Live Location Intelligence', 'Live Map')}
              </h2>
            </div>
            <LiveMap />
          </div>
        </div>

        {/* Cost Center */}
        <div className="card-enhanced p-6">
          <div className="flex items-center space-x-2 mb-6">
            <DollarSign className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">
              {translate('Cost Center', 'Cost Tracking')}
            </h2>
          </div>
          <CostCenter />
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environmental Intel */}
        <div className="card-enhanced p-6">
          <div className="flex items-center space-x-2 mb-6">
            <CloudRain className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">
              {translate('Environmental Intel', 'Weather Conditions')}
            </h2>
          </div>
          <WeatherWidget />
        </div>

        {/* PavementScan Pro */}
        <div className="card-enhanced p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Scan className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">
              PavementScan Pro
            </h2>
          </div>
          <PavementScanWidget />
        </div>

        {/* AI Estimator */}
        <div className="card-enhanced p-6">
          <AIEstimatorWidget />
        </div>

        {/* Fleet Status */}
        <div className="card-enhanced p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Truck className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">
              {translate('Fleet Status', 'Vehicle Status')}
            </h2>
          </div>
          <FleetStatus />
        </div>
      </div>

      {/* Bottom Section - Alerts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Feed */}
        <div className="card-enhanced p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">
              {translate('Alert Stream', 'Recent Alerts')}
            </h2>
          </div>
          <AlertsFeed alerts={dashboardData?.alerts || []} />
        </div>

        {/* Quick Analytics */}
        <div className="card-enhanced p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">
              {translate('Mission Analytics', 'Performance Metrics')}
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {translate('Scans Completed Today', 'Today\'s Scans')}
              </span>
              <span className="font-bold text-accent">{dashboardData?.kpis.completedScans || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {translate('Defects Identified', 'Issues Found')}
              </span>
              <span className="font-bold text-yellow-500">{dashboardData?.kpis.defectsDetected || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {translate('Operational Efficiency', 'Efficiency Rating')}
              </span>
              <span className="font-bold text-primary">
                {dashboardData?.kpis.activePersonnel && dashboardData?.kpis.vehiclesDeployed ? 
                  (((dashboardData.kpis.activePersonnel + dashboardData.kpis.vehiclesDeployed) / 
                    (dashboardData.kpis.activeProjects || 1) * 100)).toFixed(1) + '%' : 
                  '94.2%'
                }
              </span>
            </div>
            {dashboardData?.lastUpdated && (
              <div className="text-xs text-muted-foreground text-center">
                Last updated: {new Date(dashboardData.lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}