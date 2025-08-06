import React, { useState, useEffect } from 'react'
import { CloudRain, Sun, Cloud, Wind, Droplets, Thermometer, AlertTriangle, Shield, Eye, Gauge } from 'lucide-react'
import { useTerminology } from '../../contexts/TerminologyContext'
import { weatherService, WeatherData, WeatherAlert } from '../../services/weatherService'

export const WeatherWidget: React.FC = () => {
  const { translate } = useTerminology()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [suitability, setSuitability] = useState<{
    suitable: boolean
    reasons: string[]
    recommendations: string[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        const [weatherData, suitabilityData] = await Promise.all([
          weatherService.getCurrentWeather(),
          weatherService.isGoodForSealcoating()
        ])
        setWeather(weatherData)
        setSuitability(suitabilityData)
        setError(null)
      } catch (err) {
        console.error('Error fetching weather:', err)
        setError('Failed to load weather data')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()

    // Update every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (conditions: string) => {
    if (conditions.toLowerCase().includes('rain')) return <CloudRain className="h-6 w-6 text-blue-500" />
    if (conditions.toLowerCase().includes('cloud')) return <Cloud className="h-6 w-6 text-gray-500" />
    return <Sun className="h-6 w-6 text-yellow-500" />
  }

  const getAlertIcon = (type: WeatherAlert['type']) => {
    switch (type) {
      case 'rain': return <CloudRain className="h-4 w-4" />
      case 'temperature': return <Thermometer className="h-4 w-4" />
      case 'wind': return <Wind className="h-4 w-4" />
      case 'uv': return <Sun className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getAlertColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-800'
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'high': return 'border-orange-200 bg-orange-50 text-orange-800'
      case 'critical': return 'border-red-200 bg-red-50 text-red-800'
      default: return 'border-gray-200 bg-gray-50 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <div className="animate-pulse">Loading weather data...</div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="flex items-center justify-center h-48 text-red-500">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <div className="text-sm">{error || 'Weather data unavailable'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Weather Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getWeatherIcon(weather.current.conditions)}
          <div>
            <div className="font-semibold text-2xl">{weather.current.temperature.toFixed(0)}°F</div>
            <div className="text-sm text-muted-foreground">{weather.current.conditions}</div>
            <div className="text-xs text-muted-foreground">{weather.location.name}</div>
          </div>
        </div>
        
        {/* Sealcoating Suitability */}
        <div className="text-right">
          <div className={`text-sm font-medium flex items-center space-x-1 ${
            suitability?.suitable ? 'text-green-600' : 'text-red-600'
          }`}>
            <Shield className="h-4 w-4" />
            <span>{suitability?.suitable ? 'Suitable' : 'Not Suitable'}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {translate('For Sealcoating', 'For Sealcoating')}
          </div>
        </div>
      </div>

      {/* Detailed Conditions */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="flex items-center space-x-2">
          <Thermometer className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{weather.current.feelsLike.toFixed(0)}°F</div>
            <div className="text-xs text-muted-foreground">Feels like</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Wind className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{weather.current.windSpeed.toFixed(0)} mph</div>
            <div className="text-xs text-muted-foreground">Wind</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Droplets className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{weather.current.humidity}%</div>
            <div className="text-xs text-muted-foreground">Humidity</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <CloudRain className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{weather.current.precipitation.toFixed(2)}"</div>
            <div className="text-xs text-muted-foreground">Rain</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{weather.current.visibility.toFixed(0)} mi</div>
            <div className="text-xs text-muted-foreground">Visibility</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{weather.current.pressure.toFixed(2)}"</div>
            <div className="text-xs text-muted-foreground">Pressure</div>
          </div>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {translate('Next 6 Hours', 'Next 6 Hours')}
        </h4>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {weather.hourly.slice(0, 6).map((hour, index) => (
            <div key={index} className="flex-shrink-0 text-center p-2 bg-muted rounded-lg min-w-16">
              <div className="text-xs text-muted-foreground mb-1">
                {new Date(hour.datetime).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  hour12: true 
                })}
              </div>
              <img src={hour.icon} alt={hour.conditions} className="w-8 h-8 mx-auto mb-1" />
              <div className="text-sm font-medium">{hour.temperature.toFixed(0)}°</div>
              {hour.precipitation > 0 && (
                <div className="text-xs text-blue-500">{hour.precipitation.toFixed(1)}"</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Suitability Assessment */}
      {suitability && (
        <div className={`p-3 rounded-lg border ${
          suitability.suitable 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <Shield className={`h-4 w-4 ${
              suitability.suitable ? 'text-green-600' : 'text-red-600'
            }`} />
            <span className={`text-sm font-medium ${
              suitability.suitable ? 'text-green-800' : 'text-red-800'
            }`}>
              {translate('Sealcoating Assessment', 'Sealcoating Assessment')}
            </span>
          </div>
          
          {suitability.reasons.length > 0 && (
            <div className="space-y-1 mb-2">
              {suitability.reasons.map((reason, index) => (
                <div key={index} className={`text-xs ${
                  suitability.suitable ? 'text-green-700' : 'text-red-700'
                }`}>
                  • {reason}
                </div>
              ))}
            </div>
          )}
          
          <div className="space-y-1">
            {suitability.recommendations.map((rec, index) => (
              <div key={index} className={`text-xs font-medium ${
                suitability.suitable ? 'text-green-800' : 'text-red-800'
              }`}>
                💡 {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Alerts */}
      {weather.alerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{translate('Weather Alerts', 'Weather Alerts')}</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {weather.alerts.map((alert) => (
              <div key={alert.id} className={`text-xs rounded-lg p-3 border ${getAlertColor(alert.severity)}`}>
                <div className="flex items-center space-x-2 mb-1">
                  {getAlertIcon(alert.type)}
                  <span className="font-medium">{alert.title}</span>
                  <span className="text-xs opacity-75 ml-auto">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="mb-2">{alert.description}</div>
                <div className="font-medium">💡 {alert.recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground text-center">
        Last updated: {weather.lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  )
}