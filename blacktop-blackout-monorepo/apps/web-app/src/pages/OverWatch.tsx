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
  TrendingUp
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
import { KPICard } from '../components/ui/KPICard'
import { StatusIndicator } from '../components/ui/StatusIndicator'

export const OverWatch: React.FC = () => {
  const { translate } = useTerminology()
  const { connected: socketConnected } = useSocket()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Mock data - in real implementation, this would come from API/Socket
  const mockKPIs = {
    activePersonnel: 3,
    vehiclesDeployed: 2,
    dailyCosts: 1247.50,
    activeAlerts: 1,
    completedScans: 12,
    defectsDetected: 7
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-2xl font-bold text-gradient mb-2">
            {translate('OverWatch', 'Monitoring')} {translate('System', 'System')}
          </div>
          <div className="text-muted-foreground">
            {translate('Initializing Command Center', 'Loading Dashboard')}...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-gradient">
              {translate('OverWatch-Ops', 'Operations Center')}
            </h1>
          </div>
          <StatusIndicator 
            status={socketConnected ? 'online' : 'offline'} 
            label={translate('Comms', 'Connection')}
            pulse={socketConnected}
          />
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-primary">
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="kpi-grid">
        <KPICard
          icon={Users}
          label={translate('Active Personnel', 'Active Employees')}
          value={mockKPIs.activePersonnel}
          trend="+1"
          color="text-accent"
        />
        <KPICard
          icon={Truck}
          label={translate('Assets Deployed', 'Vehicles Out')}
          value={mockKPIs.vehiclesDeployed}
          trend="0"
          color="text-primary"
        />
        <KPICard
          icon={DollarSign}
          label={translate('Daily Operational Cost', 'Daily Expenses')}
          value={`$${mockKPIs.dailyCosts.toFixed(2)}`}
          trend="+$127"
          color="text-yellow-500"
        />
        <KPICard
          icon={AlertTriangle}
          label={translate('Active Alerts', 'Current Alerts')}
          value={mockKPIs.activeAlerts}
          trend="-2"
          color="text-red-500"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Map and Cost Center */}
        <div className="xl:col-span-2 space-y-6">
          {/* Live Map */}
          <div className="card-enhanced p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">
                  {translate('Tactical Map', 'Live Location Tracking')}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <Radio className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">
                  {translate('Real-time Intel', 'Live Updates')}
                </span>
              </div>
            </div>
            <LiveMap />
          </div>

          {/* Personnel Grid */}
          <div className="card-enhanced p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">
                {translate('Personnel Status', 'Employee Status')}
              </h2>
            </div>
            <PersonnelGrid />
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          {/* Cost Center */}
          <div className="card-enhanced p-6">
            <div className="flex items-center space-x-2 mb-6">
              <DollarSign className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">
                {translate('Cost Center', 'Daily Expenses')}
              </h2>
            </div>
            <CostCenter />
          </div>

          {/* Weather Intelligence */}
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
          <AlertsFeed />
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
              <span className="font-bold text-accent">{mockKPIs.completedScans}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {translate('Defects Identified', 'Issues Found')}
              </span>
              <span className="font-bold text-yellow-500">{mockKPIs.defectsDetected}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {translate('Operational Efficiency', 'Efficiency Rating')}
              </span>
              <span className="font-bold text-primary">94.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}