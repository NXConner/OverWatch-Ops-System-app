import React, { useState, useEffect } from 'react'
import { CloudRain, Sun, Cloud, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react'
import { useTerminology } from '../../contexts/TerminologyContext'

interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  conditions: string
  precipitation: number
  alerts: string[]
}

export const WeatherWidget: React.FC = () => {
  const { translate } = useTerminology()
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 72,
    feelsLike: 75,
    humidity: 65,
    windSpeed: 8,
    conditions: 'Partly Cloudy',
    precipitation: 0,
    alerts: []
  })

  // Mock weather updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 3)
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (conditions: string) => {
    if (conditions.includes('Rain')) return <CloudRain className="h-8 w-8 text-blue-500" />
    if (conditions.includes('Cloud')) return <Cloud className="h-8 w-8 text-gray-400" />
    return <Sun className="h-8 w-8 text-yellow-500" />
  }

  const getRecommendation = () => {
    if (weather.precipitation > 0) {
      return {
        text: translate('Rain detected. Do not begin sealcoating operations.', 'Rain detected. Delay sealcoating work.'),
        color: 'text-red-500',
        icon: <AlertTriangle className="h-4 w-4" />
      }
    }
    if (weather.temperature < 50) {
      return {
        text: translate('Temperature too low for optimal sealing.', 'Too cold for sealing work.'),
        color: 'text-yellow-500',
        icon: <AlertTriangle className="h-4 w-4" />
      }
    }
    return {
      text: translate('Conditions favorable for operations.', 'Good conditions for work.'),
      color: 'text-green-500',
      icon: null
    }
  }

  const recommendation = getRecommendation()

  return (
    <div className="space-y-4">
      {/* Current Conditions */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          {getWeatherIcon(weather.conditions)}
        </div>
        <div className="text-3xl font-bold text-primary mb-1">
          {Math.round(weather.temperature)}°F
        </div>
        <div className="text-sm text-muted-foreground">
          Feels like {Math.round(weather.feelsLike)}°F
        </div>
        <div className="text-sm text-muted-foreground">
          {weather.conditions}
        </div>
      </div>

      {/* Weather Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-sm">{translate('Humidity', 'Humidity')}</span>
          </div>
          <span className="text-sm font-medium">{weather.humidity}%</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{translate('Wind Speed', 'Wind')}</span>
          </div>
          <span className="text-sm font-medium">{Math.round(weather.windSpeed)} mph</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <CloudRain className="h-4 w-4 text-blue-500" />
            <span className="text-sm">{translate('Precipitation', 'Rain')}</span>
          </div>
          <span className="text-sm font-medium">{weather.precipitation}%</span>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className={`p-3 rounded-lg border border-border ${recommendation.color.includes('red') ? 'bg-red-500/10' : recommendation.color.includes('yellow') ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
        <div className="flex items-center space-x-2">
          {recommendation.icon}
          <span className={`text-sm font-medium ${recommendation.color}`}>
            {recommendation.text}
          </span>
        </div>
      </div>

      {/* 12-Hour Forecast */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {translate('12-Hour Forecast', '12-Hour Outlook')}
        </h4>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[1, 2, 3, 4].map(hour => (
            <div key={hour} className="p-2 bg-muted rounded">
              <div className="text-muted-foreground">
                {new Date(Date.now() + hour * 3 * 60 * 60 * 1000).getHours()}:00
              </div>
              <Cloud className="h-4 w-4 mx-auto my-1 text-gray-400" />
              <div className="font-medium">
                {Math.round(weather.temperature - hour)}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}