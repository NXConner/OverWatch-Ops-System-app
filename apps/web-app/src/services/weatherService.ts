import axios from 'axios'

export interface WeatherConditions {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  visibility: number
  uvIndex: number
  dewPoint: number
  conditions: string
  precipitation: number
  precipitationProbability: number
  cloudCover: number
}

export interface WeatherForecast {
  datetime: string
  temperature: number
  precipitation: number
  windSpeed: number
  conditions: string
  icon: string
}

export interface WeatherAlert {
  id: string
  type: 'rain' | 'temperature' | 'wind' | 'uv' | 'air_quality'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  recommendation: string
  timestamp: Date
  expiresAt: Date
}

export interface WeatherData {
  current: WeatherConditions
  hourly: WeatherForecast[]
  daily: WeatherForecast[]
  alerts: WeatherAlert[]
  location: {
    name: string
    lat: number
    lon: number
  }
  lastUpdated: Date
}

class WeatherService {
  private readonly API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'demo_key'
  private readonly BASE_URL = 'https://api.weatherapi.com/v1'
  private readonly STUART_VA_COORDS = { lat: 36.5962, lon: -80.2741 }
  
  // Cache for weather data
  private cache = new Map<string, { data: WeatherData; timestamp: number }>()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  async getCurrentWeather(lat?: number, lon?: number): Promise<WeatherData> {
    const coords = lat && lon ? { lat, lon } : this.STUART_VA_COORDS
    const cacheKey = `${coords.lat},${coords.lon}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Get current weather and forecast
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(`${this.BASE_URL}/current.json`, {
          params: {
            key: this.API_KEY,
            q: `${coords.lat},${coords.lon}`,
            aqi: 'yes'
          }
        }),
        axios.get(`${this.BASE_URL}/forecast.json`, {
          params: {
            key: this.API_KEY,
            q: `${coords.lat},${coords.lon}`,
            days: 3,
            aqi: 'yes',
            alerts: 'yes'
          }
        })
      ])

      const current = currentResponse.data.current
      const forecast = forecastResponse.data.forecast
      const location = currentResponse.data.location

      const weatherData: WeatherData = {
        current: {
          temperature: current.temp_f,
          feelsLike: current.feelslike_f,
          humidity: current.humidity,
          windSpeed: current.wind_mph,
          windDirection: current.wind_degree,
          pressure: current.pressure_in,
          visibility: current.vis_miles,
          uvIndex: current.uv,
          dewPoint: current.dewpoint_f,
          conditions: current.condition.text,
          precipitation: current.precip_in,
          precipitationProbability: 0, // Not available in current
          cloudCover: current.cloud
        },
        hourly: this.processHourlyForecast(forecast.forecastday),
        daily: this.processDailyForecast(forecast.forecastday),
        alerts: this.generateOperationalAlerts(current, forecast),
        location: {
          name: location.name,
          lat: location.lat,
          lon: location.lon
        },
        lastUpdated: new Date()
      }

      // Cache the result
      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() })

      return weatherData
    } catch (error) {
      console.error('Weather API error:', error)
      
      // Return mock data if API fails
      return this.getMockWeatherData(coords)
    }
  }

  private processHourlyForecast(forecastDays: any[]): WeatherForecast[] {
    const hourly: WeatherForecast[] = []
    
    // Get next 12 hours
    const now = new Date()
    const currentHour = now.getHours()
    
    for (let i = 0; i < 12; i++) {
      const targetHour = (currentHour + i) % 24
      const dayIndex = Math.floor((currentHour + i) / 24)
      
      if (dayIndex < forecastDays.length) {
        const day = forecastDays[dayIndex]
        const hourData = day.hour[targetHour]
        
        if (hourData) {
          hourly.push({
            datetime: hourData.time,
            temperature: hourData.temp_f,
            precipitation: hourData.precip_in,
            windSpeed: hourData.wind_mph,
            conditions: hourData.condition.text,
            icon: hourData.condition.icon
          })
        }
      }
    }
    
    return hourly
  }

  private processDailyForecast(forecastDays: any[]): WeatherForecast[] {
    return forecastDays.map(day => ({
      datetime: day.date,
      temperature: day.day.avgtemp_f,
      precipitation: day.day.totalprecip_in,
      windSpeed: day.day.maxwind_mph,
      conditions: day.day.condition.text,
      icon: day.day.condition.icon
    }))
  }

  private generateOperationalAlerts(current: any, forecast: any): WeatherAlert[] {
    const alerts: WeatherAlert[] = []
    const now = new Date()

    // Rain alerts for sealcoating operations
    if (current.precip_in > 0 || current.chance_of_rain > 30) {
      alerts.push({
        id: 'rain-current',
        type: 'rain',
        severity: current.precip_in > 0.1 ? 'high' : 'medium',
        title: 'Rain Detected',
        description: `Current precipitation: ${current.precip_in}" with ${current.chance_of_rain}% chance of rain`,
        recommendation: 'Do not begin sealcoating operations. Material requires 24 hours dry weather.',
        timestamp: now,
        expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000) // 4 hours
      })
    }

    // Temperature alerts
    if (current.temp_f < 50) {
      alerts.push({
        id: 'temp-low',
        type: 'temperature',
        severity: current.temp_f < 35 ? 'critical' : 'medium',
        title: 'Low Temperature Warning',
        description: `Current temperature: ${current.temp_f}°F`,
        recommendation: 'Temperature too low for optimal sealcoating. Wait for warmer conditions.',
        timestamp: now,
        expiresAt: new Date(now.getTime() + 6 * 60 * 60 * 1000) // 6 hours
      })
    }

    if (current.temp_f > 95) {
      alerts.push({
        id: 'temp-high',
        type: 'temperature',
        severity: 'medium',
        title: 'High Temperature Advisory',
        description: `Current temperature: ${current.temp_f}°F`,
        recommendation: 'Extreme heat may affect material performance. Consider early morning or late afternoon work.',
        timestamp: now,
        expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000)
      })
    }

    // Wind alerts
    if (current.wind_mph > 15) {
      alerts.push({
        id: 'wind-high',
        type: 'wind',
        severity: current.wind_mph > 25 ? 'high' : 'medium',
        title: 'High Wind Advisory',
        description: `Current wind speed: ${current.wind_mph} mph`,
        recommendation: 'High winds may affect spray application quality. Use caution with sealcoating.',
        timestamp: now,
        expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000)
      })
    }

    // UV alerts
    if (current.uv > 8) {
      alerts.push({
        id: 'uv-high',
        type: 'uv',
        severity: current.uv > 10 ? 'high' : 'medium',
        title: 'High UV Index',
        description: `Current UV Index: ${current.uv}`,
        recommendation: 'Ensure crew protection from UV exposure. Consider timing breaks during peak hours.',
        timestamp: now,
        expiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000)
      })
    }

    // Future rain alerts (next 12 hours)
    forecast.forecastday[0]?.hour?.forEach((hour: any, index: number) => {
      if (index > new Date().getHours() && hour.chance_of_rain > 70) {
        const hourTime = new Date(hour.time)
        alerts.push({
          id: `rain-forecast-${index}`,
          type: 'rain',
          severity: hour.chance_of_rain > 90 ? 'high' : 'medium',
          title: 'Rain Forecast Alert',
          description: `${hour.chance_of_rain}% chance of rain at ${hourTime.toLocaleTimeString()}`,
          recommendation: 'Plan to complete sealcoating before rain arrives. Allow drying time.',
          timestamp: now,
          expiresAt: hourTime
        })
      }
    })

    return alerts
  }

  private getMockWeatherData(coords: { lat: number; lon: number }): WeatherData {
    const now = new Date()
    
    return {
      current: {
        temperature: 72,
        feelsLike: 75,
        humidity: 65,
        windSpeed: 8,
        windDirection: 180,
        pressure: 30.15,
        visibility: 10,
        uvIndex: 6,
        dewPoint: 58,
        conditions: 'Partly Cloudy',
        precipitation: 0,
        precipitationProbability: 20,
        cloudCover: 35
      },
      hourly: Array.from({ length: 12 }, (_, i) => ({
        datetime: new Date(now.getTime() + i * 60 * 60 * 1000).toISOString(),
        temperature: 72 + Math.random() * 6 - 3,
        precipitation: Math.random() * 0.1,
        windSpeed: 8 + Math.random() * 4,
        conditions: 'Partly Cloudy',
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
      })),
      daily: Array.from({ length: 3 }, (_, i) => ({
        datetime: new Date(now.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        temperature: 73 + Math.random() * 8 - 4,
        precipitation: Math.random() * 0.2,
        windSpeed: 10 + Math.random() * 5,
        conditions: 'Partly Cloudy',
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
      })),
      alerts: [],
      location: {
        name: 'Stuart, VA',
        lat: coords.lat,
        lon: coords.lon
      },
      lastUpdated: now
    }
  }

  async getWeatherAlerts(lat?: number, lon?: number): Promise<WeatherAlert[]> {
    const weatherData = await this.getCurrentWeather(lat, lon)
    return weatherData.alerts
  }

  async getHourlyForecast(lat?: number, lon?: number): Promise<WeatherForecast[]> {
    const weatherData = await this.getCurrentWeather(lat, lon)
    return weatherData.hourly
  }

  async isGoodForSealcoating(lat?: number, lon?: number): Promise<{
    suitable: boolean
    reasons: string[]
    recommendations: string[]
  }> {
    const weather = await this.getCurrentWeather(lat, lon)
    const current = weather.current
    
    const reasons: string[] = []
    const recommendations: string[] = []
    let suitable = true

    // Check temperature
    if (current.temperature < 50) {
      suitable = false
      reasons.push(`Temperature too low (${current.temperature}°F)`)
      recommendations.push('Wait for temperature above 50°F')
    } else if (current.temperature > 95) {
      reasons.push(`High temperature (${current.temperature}°F)`)
      recommendations.push('Consider working during cooler hours')
    }

    // Check precipitation
    if (current.precipitation > 0) {
      suitable = false
      reasons.push(`Active precipitation (${current.precipitation}")`)
      recommendations.push('Wait for dry conditions')
    }

    // Check wind
    if (current.windSpeed > 20) {
      suitable = false
      reasons.push(`High wind speed (${current.windSpeed} mph)`)
      recommendations.push('Wait for calmer conditions')
    } else if (current.windSpeed > 15) {
      reasons.push(`Moderate wind (${current.windSpeed} mph)`)
      recommendations.push('Use caution with spray application')
    }

    // Check humidity
    if (current.humidity > 85) {
      reasons.push(`High humidity (${current.humidity}%)`)
      recommendations.push('Allow extra drying time')
    }

    // Check upcoming weather
    const nextHours = weather.hourly.slice(0, 6) // Next 6 hours
    const rainInNext6Hours = nextHours.some(hour => hour.precipitation > 0.1)
    
    if (rainInNext6Hours) {
      suitable = false
      reasons.push('Rain expected within 6 hours')
      recommendations.push('Material needs 24 hours dry time - postpone until better forecast')
    }

    if (suitable && reasons.length === 0) {
      recommendations.push('Conditions favorable for sealcoating operations')
    }

    return { suitable, reasons, recommendations }
  }
}

export const weatherService = new WeatherService()