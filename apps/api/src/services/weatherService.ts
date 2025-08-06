import axios from 'axios'

interface WeatherConditions {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  visibility: number
  uvIndex: number
  conditions: string
  precipitation: number
  dewPoint: number
}

interface WeatherForecast {
  datetime: Date
  temperature: number
  conditions: string
  precipitation: number
  windSpeed: number
  humidity: number
  icon: string
}

interface WeatherAlert {
  id: string
  type: 'rain' | 'temperature' | 'wind' | 'uv' | 'general'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  recommendation: string
  timestamp: Date
}

interface WeatherData {
  current: WeatherConditions
  hourly: WeatherForecast[]
  daily: WeatherForecast[]
  alerts: WeatherAlert[]
  location: {
    name: string
    region: string
    country: string
    lat: number
    lon: number
  }
  lastUpdated: Date
}

class WeatherService {
  private readonly API_KEY = process.env.WEATHER_API_KEY || 'demo_key'
  private readonly BASE_URL = 'https://api.weatherapi.com/v1'
  private readonly STUART_VA_COORDS = { lat: 36.5962, lon: -80.2741 }
  private cache = new Map<string, { data: WeatherData; timestamp: number }>()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  async getCurrentWeather(lat?: number, lon?: number): Promise<WeatherData> {
    const coords = { 
      lat: lat || this.STUART_VA_COORDS.lat, 
      lon: lon || this.STUART_VA_COORDS.lon 
    }
    
    const cacheKey = `weather_${coords.lat}_${coords.lon}`
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
            aqi: 'no'
          }
        }),
        axios.get(`${this.BASE_URL}/forecast.json`, {
          params: {
            key: this.API_KEY,
            q: `${coords.lat},${coords.lon}`,
            days: 3,
            aqi: 'no',
            alerts: 'yes'
          }
        })
      ])

      const current = currentResponse.data.current
      const location = currentResponse.data.location
      const forecast = forecastResponse.data.forecast

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
          conditions: current.condition.text,
          precipitation: current.precip_in,
          dewPoint: current.dewpoint_f
        },
        hourly: this.processHourlyForecast(forecast.forecastday),
        daily: this.processDailyForecast(forecast.forecastday),
        alerts: this.generateOperationalAlerts(current, forecast),
        location: {
          name: location.name,
          region: location.region,
          country: location.country,
          lat: location.lat,
          lon: location.lon
        },
        lastUpdated: new Date()
      }

      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() })
      return weatherData

    } catch (error) {
      console.error('WeatherAPI error:', error)
      // Return mock data if API fails
      return this.getMockWeatherData(coords)
    }
  }

  private processHourlyForecast(forecastDays: any[]): WeatherForecast[] {
    const hourlyData: WeatherForecast[] = []
    
    forecastDays.forEach(day => {
      day.hour.forEach((hour: any) => {
        hourlyData.push({
          datetime: new Date(hour.time),
          temperature: hour.temp_f,
          conditions: hour.condition.text,
          precipitation: hour.precip_in,
          windSpeed: hour.wind_mph,
          humidity: hour.humidity,
          icon: hour.condition.icon
        })
      })
    })
    
    return hourlyData.slice(0, 48) // Next 48 hours
  }

  private processDailyForecast(forecastDays: any[]): WeatherForecast[] {
    return forecastDays.map(day => ({
      datetime: new Date(day.date),
      temperature: day.day.avgtemp_f,
      conditions: day.day.condition.text,
      precipitation: day.day.totalprecip_in,
      windSpeed: day.day.maxwind_mph,
      humidity: day.day.avghumidity,
      icon: day.day.condition.icon
    }))
  }

  private generateOperationalAlerts(current: any, forecast: any): WeatherAlert[] {
    const alerts: WeatherAlert[] = []
    const now = new Date()

    // Temperature alerts
    if (current.temp_f < 50) {
      alerts.push({
        id: `temp_low_${now.getTime()}`,
        type: 'temperature',
        severity: 'high',
        title: 'Temperature Too Low',
        description: `Current temperature ${current.temp_f}°F is below optimal sealcoating range`,
        recommendation: 'Wait for temperatures above 50°F before beginning sealcoating operations',
        timestamp: now
      })
    } else if (current.temp_f > 95) {
      alerts.push({
        id: `temp_high_${now.getTime()}`,
        type: 'temperature',
        severity: 'medium',
        title: 'High Temperature Warning',
        description: `Current temperature ${current.temp_f}°F may cause rapid drying`,
        recommendation: 'Consider early morning or evening application to avoid extreme heat',
        timestamp: now
      })
    }

    // Precipitation alerts
    if (current.precip_in > 0) {
      alerts.push({
        id: `rain_current_${now.getTime()}`,
        type: 'rain',
        severity: 'critical',
        title: 'Active Precipitation',
        description: 'Rain detected - sealcoating operations should be halted',
        recommendation: 'Wait for precipitation to stop and surface to dry before resuming',
        timestamp: now
      })
    }

    // Wind alerts
    if (current.wind_mph > 15) {
      alerts.push({
        id: `wind_high_${now.getTime()}`,
        type: 'wind',
        severity: 'medium',
        title: 'High Wind Warning',
        description: `Wind speed ${current.wind_mph} mph may affect spray application quality`,
        recommendation: 'Consider using alternative application methods or wait for calmer conditions',
        timestamp: now
      })
    }

    // UV alerts
    if (current.uv > 8) {
      alerts.push({
        id: `uv_high_${now.getTime()}`,
        type: 'uv',
        severity: 'low',
        title: 'High UV Index',
        description: `UV index ${current.uv} - ensure crew protection`,
        recommendation: 'Provide adequate sun protection for crew members',
        timestamp: now
      })
    }

    // Forecast precipitation alerts
    const next24Hours = forecast.forecastday[0].hour.slice(new Date().getHours())
    const rainInNext24 = next24Hours.some((hour: any) => hour.precip_in > 0.01)
    
    if (rainInNext24) {
      alerts.push({
        id: `rain_forecast_${now.getTime()}`,
        type: 'rain',
        severity: 'high',
        title: 'Rain Forecast',
        description: 'Precipitation expected within 24 hours',
        recommendation: 'Plan operations to allow sufficient curing time before rain',
        timestamp: now
      })
    }

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
        conditions: 'Partly Cloudy',
        precipitation: 0,
        dewPoint: 58
      },
      hourly: Array.from({ length: 24 }, (_, i) => ({
        datetime: new Date(now.getTime() + i * 60 * 60 * 1000),
        temperature: 72 + (Math.random() - 0.5) * 10,
        conditions: 'Partly Cloudy',
        precipitation: 0,
        windSpeed: 8 + (Math.random() - 0.5) * 4,
        humidity: 65 + (Math.random() - 0.5) * 20,
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
      })),
      daily: Array.from({ length: 3 }, (_, i) => ({
        datetime: new Date(now.getTime() + i * 24 * 60 * 60 * 1000),
        temperature: 72 + (Math.random() - 0.5) * 15,
        conditions: 'Partly Cloudy',
        precipitation: 0,
        windSpeed: 10,
        humidity: 65,
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
      })),
      alerts: [],
      location: {
        name: 'Stuart',
        region: 'Virginia',
        country: 'United States',
        lat: coords.lat,
        lon: coords.lon
      },
      lastUpdated: now
    }
  }

  async getWeatherAlerts(lat?: number, lon?: number): Promise<WeatherAlert[]> {
    const weather = await this.getCurrentWeather(lat, lon)
    return weather.alerts
  }

  async getHourlyForecast(lat?: number, lon?: number): Promise<WeatherForecast[]> {
    const weather = await this.getCurrentWeather(lat, lon)
    return weather.hourly
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

    // Temperature check
    if (current.temperature < 50) {
      suitable = false
      reasons.push(`Temperature too low (${current.temperature}°F)`)
      recommendations.push('Wait for temperatures above 50°F')
    } else if (current.temperature > 95) {
      reasons.push(`High temperature (${current.temperature}°F)`)
      recommendations.push('Consider early morning or evening application')
    } else {
      reasons.push(`Temperature optimal (${current.temperature}°F)`)
    }

    // Precipitation check
    if (current.precipitation > 0) {
      suitable = false
      reasons.push('Active precipitation detected')
      recommendations.push('Wait for rain to stop and surface to dry')
    } else {
      reasons.push('No precipitation detected')
    }

    // Wind check
    if (current.windSpeed > 15) {
      reasons.push(`High wind speed (${current.windSpeed} mph)`)
      recommendations.push('Use alternative application methods or wait for calmer conditions')
    } else {
      reasons.push(`Wind speed acceptable (${current.windSpeed} mph)`)
    }

    // Humidity check
    if (current.humidity > 85) {
      reasons.push(`High humidity (${current.humidity}%)`)
      recommendations.push('Allow extra curing time due to high humidity')
    } else {
      reasons.push(`Humidity levels good (${current.humidity}%)`)
    }

    // Overall recommendations
    if (suitable) {
      recommendations.push('Conditions are suitable for sealcoating operations')
      recommendations.push('Monitor weather conditions throughout the day')
    }

    return {
      suitable,
      reasons,
      recommendations
    }
  }
}

export const weatherService = new WeatherService()
export { WeatherService, type WeatherData, type WeatherAlert, type WeatherConditions, type WeatherForecast }