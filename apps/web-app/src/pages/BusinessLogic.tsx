import React, { useState, useEffect, useRef } from 'react'
import {
  Settings, Upload, Download, Edit3, Trash2, Save, 
  FileText, Code, Database, Key, Plus, Eye, EyeOff,
  AlertTriangle, CheckCircle, Loader2, Folder,
  RefreshCw, Copy, Search, Filter, ChevronDown,
  Terminal, Globe, Brain, Wrench, Zap, CloudRain, MapPin, CreditCard, Bell, DollarSign, Calculator
} from 'lucide-react'
import { useTerminology } from '../contexts/TerminologyContext'

interface BusinessRule {
  id: string
  name: string
  category: 'pricing' | 'operations' | 'calculations' | 'validation' | 'api' | 'workflow'
  type: 'formula' | 'constant' | 'conditional' | 'api_endpoint' | 'configuration'
  value: string | number | object
  description: string
  isActive: boolean
  lastModified: Date
  modifiedBy: string
  dependencies?: string[]
  version: string
}

interface APIConfiguration {
  id: string
  name: string
  type: 'weather' | 'ai' | 'mapping' | 'payment' | 'notification' | 'external'
  endpoint: string
  apiKey: string
  headers?: Record<string, string>
  parameters?: Record<string, any>
  rateLimit?: number
  timeout?: number
  isActive: boolean
  lastTested?: Date
  testStatus?: 'success' | 'failed' | 'pending'
}

interface LogicTemplate {
  name: string
  category: string
  content: string
  description: string
}

export const BusinessLogic: React.FC = () => {
  const { translate } = useTerminology()
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>([])
  const [apiConfigs, setApiConfigs] = useState<APIConfiguration[]>([])
  const [activeTab, setActiveTab] = useState<'rules' | 'apis' | 'templates' | 'upload'>('rules')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingRule, setEditingRule] = useState<BusinessRule | null>(null)
  const [editingApi, setEditingApi] = useState<APIConfiguration | null>(null)
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load business logic data
  useEffect(() => {
    loadBusinessLogic()
  }, [])

  const loadBusinessLogic = async () => {
    try {
      setLoading(true)
      
      // Load business rules and API configurations from backend
      const [rulesResponse, apisResponse] = await Promise.all([
        fetch('/api/business-logic/rules'),
        fetch('/api/business-logic/apis')
      ])
      
      if (rulesResponse.ok && apisResponse.ok) {
        const rulesData = await rulesResponse.json()
        const apisData = await apisResponse.json()
        
        if (rulesData.success) {
          setBusinessRules(rulesData.data)
        } else {
          console.error('Failed to load business rules:', rulesData.error)
          setBusinessRules(getDefaultBusinessRules())
        }
        
        if (apisData.success) {
          setApiConfigs(apisData.data)
        } else {
          console.error('Failed to load API configurations:', apisData.error)
          setApiConfigs(getDefaultAPIConfigurations())
        }
      } else {
        // Use fallback data if API fails
        setBusinessRules(getDefaultBusinessRules())
        setApiConfigs(getDefaultAPIConfigurations())
      }
    } catch (error) {
      console.error('Failed to load business logic:', error)
      // Use fallback data on error
      setBusinessRules(getDefaultBusinessRules())
      setApiConfigs(getDefaultAPIConfigurations())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultBusinessRules = (): BusinessRule[] => [
    {
      id: '1',
      name: 'SealMaster PMM Unit Cost',
      category: 'pricing',
      type: 'constant',
      value: 3.79,
      description: 'Cost per gallon of SealMaster PMM concentrate',
      isActive: true,
      lastModified: new Date(),
      modifiedBy: 'System Admin',
      version: '1.0'
    },
    {
      id: '2',
      name: 'Coverage Calculation',
      category: 'calculations',
      type: 'formula',
      value: 'area_sqft / 80', // 80 sq ft per gallon
      description: 'Calculates gallons needed based on area (80 sq ft coverage per gallon)',
      isActive: true,
      lastModified: new Date(),
      modifiedBy: 'System Admin',
      dependencies: ['area_sqft'],
      version: '1.2'
    },
    {
      id: '3',
      name: 'Labor Rate Range',
      category: 'pricing',
      type: 'conditional',
      value: 'task_type === "prep" ? 45 : task_type === "crack_fill" ? 50 : task_type === "sealcoat" ? 55 : 40',
      description: 'Determines hourly labor rate based on task type',
      isActive: true,
      lastModified: new Date(),
      modifiedBy: 'System Admin',
      dependencies: ['task_type'],
      version: '1.1'
    },
    {
      id: '4',
      name: 'Weather Suitability Rules',
      category: 'operations',
      type: 'conditional',
      value: 'temperature >= 50 && temperature <= 95 && humidity < 85 && windSpeed < 15 && precipitation === 0',
      description: 'Determines if weather conditions are suitable for sealcoating',
      isActive: true,
      lastModified: new Date(),
      modifiedBy: 'System Admin',
      dependencies: ['temperature', 'humidity', 'windSpeed', 'precipitation'],
      version: '2.0'
    },
    {
      id: '5',
      name: 'Overhead Percentage',
      category: 'pricing',
      type: 'constant',
      value: 0.15,
      description: 'Standard overhead markup (15%)',
      isActive: true,
      lastModified: new Date(),
      modifiedBy: 'System Admin',
      version: '1.0'
    },
    {
      id: '6',
      name: 'Profit Margin',
      category: 'pricing',
      type: 'constant',
      value: 0.20,
      description: 'Standard profit margin (20%)',
      isActive: true,
      lastModified: new Date(),
      modifiedBy: 'System Admin',
      version: '1.0'
    },
    {
      id: '7',
      name: 'Sand Requirement Formula',
      category: 'calculations',
      type: 'formula',
      value: 'sealer_gallons / 6', // 1 bag per 6 gallons
      description: 'Calculates sand bags needed (1 bag per 6 gallons of sealer)',
      isActive: true,
      lastModified: new Date(),
      modifiedBy: 'System Admin',
      dependencies: ['sealer_gallons'],
      version: '1.0'
    },
    {
      id: '8',
      name: 'Project Size Multiplier',
      category: 'pricing',
      type: 'conditional',
      value: 'area_sqft > 10000 ? 0.95 : area_sqft > 5000 ? 0.98 : 1.0',
      description: 'Volume discount for larger projects',
      isActive: true,
      lastModified: new Date(),
      modifiedBy: 'System Admin',
      dependencies: ['area_sqft'],
      version: '1.0'
    }
  ]

  const getDefaultAPIConfigurations = (): APIConfiguration[] => [
    {
      id: '1',
      name: 'WeatherAPI',
      type: 'weather',
      endpoint: 'https://api.weatherapi.com/v1',
      apiKey: process.env.REACT_APP_WEATHER_API_KEY || '',
      headers: { 'Content-Type': 'application/json' },
      rateLimit: 1000000,
      timeout: 5000,
      isActive: true,
      lastTested: new Date(),
      testStatus: 'success'
    },
    {
      id: '2',
      name: 'Google Gemini AI',
      type: 'ai',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      apiKey: '',
      headers: { 'Content-Type': 'application/json' },
      parameters: {
        model: 'gemini-1.5-pro',
        temperature: 0.3,
        maxTokens: 4000
      },
      rateLimit: 60,
      timeout: 30000,
      isActive: false,
      testStatus: 'pending'
    },
    {
      id: '3',
      name: 'Google Maps API',
      type: 'mapping',
      endpoint: 'https://maps.googleapis.com/maps/api',
      apiKey: '',
      headers: { 'Content-Type': 'application/json' },
      rateLimit: 25000,
      timeout: 10000,
      isActive: false,
      testStatus: 'pending'
    },
    {
      id: '4',
      name: 'Stripe Payment Processing',
      type: 'payment',
      endpoint: 'https://api.stripe.com/v1',
      apiKey: '',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      rateLimit: 100,
      timeout: 15000,
      isActive: false,
      testStatus: 'pending'
    }
  ]

  const getLogicTemplates = (): LogicTemplate[] => [
    {
      name: 'Material Cost Calculation',
      category: 'pricing',
      content: `// Material Cost Calculation Template
const calculateMaterialCost = (area_sqft, surface_type, condition) => {
  const base_coverage = 80; // sq ft per gallon
  const coverage_adjustment = condition === 'poor' ? 0.8 : condition === 'fair' ? 0.9 : 1.0;
  const actual_coverage = base_coverage * coverage_adjustment;
  
  const sealer_gallons = area_sqft / actual_coverage;
  const sealer_cost = sealer_gallons * 3.79; // PMM cost per gallon
  
  const sand_bags = Math.ceil(sealer_gallons / 6); // 1 bag per 6 gallons
  const sand_cost = sand_bags * 10.00;
  
  return {
    sealer_gallons,
    sealer_cost,
    sand_bags,
    sand_cost,
    total_material_cost: sealer_cost + sand_cost
  };
};`,
      description: 'Template for calculating material costs based on area and surface conditions'
    },
    {
      name: 'Labor Time Estimation',
      category: 'operations',
      content: `// Labor Time Estimation Template
const estimateLaborTime = (area_sqft, surface_type, condition, access_complexity) => {
  const base_rate = 800; // sq ft per hour base rate
  
  // Adjust for surface condition
  const condition_multiplier = {
    'excellent': 1.0,
    'good': 1.1,
    'fair': 1.3,
    'poor': 1.6
  };
  
  // Adjust for access complexity
  const access_multiplier = {
    'easy': 1.0,
    'moderate': 1.2,
    'difficult': 1.5,
    'very_difficult': 2.0
  };
  
  const adjusted_rate = base_rate * 
    (condition_multiplier[condition] || 1.1) * 
    (access_multiplier[access_complexity] || 1.2);
  
  const prep_hours = area_sqft / (adjusted_rate * 1.5); // Prep is slower
  const seal_hours = area_sqft / adjusted_rate;
  const cleanup_hours = Math.max(1, area_sqft / 2000); // Minimum 1 hour
  
  return {
    prep_hours,
    seal_hours,
    cleanup_hours,
    total_hours: prep_hours + seal_hours + cleanup_hours
  };
};`,
      description: 'Template for estimating labor hours based on project complexity'
    },
    {
      name: 'Weather Validation',
      category: 'validation',
      content: `// Weather Validation Template
const validateWeatherConditions = (weather) => {
  const {temperature, humidity, windSpeed, precipitation, forecast} = weather;
  
  const validations = {
    temperature: {
      valid: temperature >= 50 && temperature <= 95,
      message: temperature < 50 ? 'Temperature too low (<50°F)' : 
               temperature > 95 ? 'Temperature too high (>95°F)' : 'Temperature OK'
    },
    humidity: {
      valid: humidity < 85,
      message: humidity >= 85 ? 'Humidity too high (≥85%)' : 'Humidity OK'
    },
    wind: {
      valid: windSpeed < 15,
      message: windSpeed >= 15 ? 'Wind speed too high (≥15mph)' : 'Wind OK'
    },
    precipitation: {
      valid: precipitation === 0,
      message: precipitation > 0 ? 'Active precipitation detected' : 'No precipitation'
    }
  };
  
  const overall_suitable = Object.values(validations).every(v => v.valid);
  
  return {
    suitable: overall_suitable,
    validations,
    recommendation: overall_suitable ? 
      'Conditions suitable for sealcoating' : 
      'Wait for better conditions'
  };
};`,
      description: 'Template for validating weather conditions for sealcoating operations'
    }
  ]

  const filteredRules = businessRules.filter(rule => {
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredApis = apiConfigs.filter(api => {
    const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         api.type.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleSaveRule = async (rule: BusinessRule) => {
    setSaving(true)
    try {
      const isNew = rule.id === 'new'
      const url = isNew ? '/api/business-logic/rules' : `/api/business-logic/rules/${rule.id}`
      const method = isNew ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: rule.name,
          category: rule.category,
          type: rule.type,
          value: rule.value,
          description: rule.description,
          isActive: rule.isActive,
          dependencies: rule.dependencies || [],
          version: rule.version
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (isNew) {
          rule.id = data.data.id
          rule.lastModified = new Date()
          rule.modifiedBy = 'Current User'
          setBusinessRules(prev => [...prev, rule])
        } else {
          setBusinessRules(prev => prev.map(r => 
            r.id === rule.id ? { ...rule, lastModified: new Date() } : r
          ))
        }
        setEditingRule(null)
      } else {
        console.error('Failed to save rule:', data.error)
        alert('Failed to save business rule: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to save rule:', error)
      alert('Failed to save business rule. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this business rule?')) {
      setBusinessRules(prev => prev.filter(r => r.id !== ruleId))
    }
  }

  const handleSaveApi = async (api: APIConfiguration) => {
    setSaving(true)
    try {
      if (api.id === 'new') {
        api.id = Date.now().toString()
        setApiConfigs(prev => [...prev, api])
      } else {
        setApiConfigs(prev => prev.map(a => a.id === api.id ? api : a))
      }
      setEditingApi(null)
    } catch (error) {
      console.error('Failed to save API configuration:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleTestApi = async (api: APIConfiguration) => {
    try {
      setApiConfigs(prev => prev.map(a => 
        a.id === api.id ? { ...a, testStatus: 'pending' } : a
      ))
      
      // Simulate API test
      setTimeout(() => {
        setApiConfigs(prev => prev.map(a => 
          a.id === api.id ? { 
            ...a, 
            testStatus: Math.random() > 0.3 ? 'success' : 'failed',
            lastTested: new Date()
          } : a
        ))
      }, 2000)
    } catch (error) {
      console.error('API test failed:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      // Parse and validate the uploaded logic file
      const uploadedRules = JSON.parse(content)
      
      if (Array.isArray(uploadedRules)) {
        setBusinessRules(prev => [...prev, ...uploadedRules.map(rule => ({
          ...rule,
          id: Date.now().toString() + Math.random(),
          lastModified: new Date(),
          modifiedBy: 'File Upload'
        }))])
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('Failed to parse uploaded file. Please ensure it contains valid JSON.')
    }
  }

  const handleExportLogic = () => {
    const exportData = {
      businessRules,
      apiConfigs,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `business-logic-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pricing': return <DollarSign className="h-4 w-4" />
      case 'operations': return <Wrench className="h-4 w-4" />
      case 'calculations': return <Calculator className="h-4 w-4" />
      case 'validation': return <CheckCircle className="h-4 w-4" />
      case 'api': return <Globe className="h-4 w-4" />
      case 'workflow': return <Zap className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getApiTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return <CloudRain className="h-4 w-4" />
      case 'ai': return <Brain className="h-4 w-4" />
      case 'mapping': return <MapPin className="h-4 w-4" />
      case 'payment': return <CreditCard className="h-4 w-4" />
      case 'notification': return <Bell className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading business logic...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {translate('Business Logic Management', 'Logic Management')}
            </h1>
            <p className="text-muted-foreground">
              Configure rules, formulas, APIs, and operational logic
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportLogic}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { key: 'rules', label: 'Business Rules', icon: FileText },
          { key: 'apis', label: 'API Configurations', icon: Globe },
          { key: 'templates', label: 'Logic Templates', icon: Code },
          { key: 'upload', label: 'Upload & Import', icon: Upload }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      {(activeTab === 'rules' || activeTab === 'apis') && (
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          {activeTab === 'rules' && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="all">All Categories</option>
                <option value="pricing">Pricing</option>
                <option value="operations">Operations</option>
                <option value="calculations">Calculations</option>
                <option value="validation">Validation</option>
                <option value="api">API</option>
                <option value="workflow">Workflow</option>
              </select>
            </div>
          )}
          
          <button
            onClick={() => {
              if (activeTab === 'rules') {
                setEditingRule({
                  id: 'new',
                  name: '',
                  category: 'pricing',
                  type: 'constant',
                  value: '',
                  description: '',
                  isActive: true,
                  lastModified: new Date(),
                  modifiedBy: 'Current User',
                  version: '1.0'
                })
              } else {
                setEditingApi({
                  id: 'new',
                  name: '',
                  type: 'external',
                  endpoint: '',
                  apiKey: '',
                  isActive: true
                })
              }
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add {activeTab === 'rules' ? 'Rule' : 'API'}</span>
          </button>
        </div>
      )}

      {/* Content */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {filteredRules.map(rule => (
            <div key={rule.id} className="card-enhanced p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-primary">
                    {getCategoryIcon(rule.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{rule.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {rule.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        v{rule.version}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">{rule.description}</p>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      {typeof rule.value === 'object' ? 
                        JSON.stringify(rule.value, null, 2) : 
                        rule.value.toString()
                      }
                    </div>
                    {rule.dependencies && rule.dependencies.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">Dependencies: </span>
                        {rule.dependencies.map(dep => (
                          <span key={dep} className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs mr-1">
                            {dep}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="btn-ghost p-2"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="btn-ghost p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'apis' && (
        <div className="space-y-4">
          {filteredApis.map(api => (
            <div key={api.id} className="card-enhanced p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-primary">
                    {getApiTypeIcon(api.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{api.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        api.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {api.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {api.type}
                      </span>
                      {api.testStatus && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          api.testStatus === 'success' ? 'bg-green-100 text-green-800' :
                          api.testStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {api.testStatus}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Endpoint: </span>
                        <span className="font-mono">{api.endpoint}</span>
                      </div>
                      <div className="text-sm flex items-center space-x-2">
                        <span className="text-muted-foreground">API Key: </span>
                        <span className="font-mono">
                          {showApiKeys[api.id] ? api.apiKey || 'Not configured' : '••••••••••••'}
                        </span>
                        <button
                          onClick={() => setShowApiKeys(prev => ({ ...prev, [api.id]: !prev[api.id] }))}
                          className="btn-ghost p-1"
                        >
                          {showApiKeys[api.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                      {api.rateLimit && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Rate Limit: </span>
                          <span>{api.rateLimit.toLocaleString()} requests/month</span>
                        </div>
                      )}
                      {api.lastTested && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Last Tested: </span>
                          <span>{api.lastTested.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestApi(api)}
                    className="btn-ghost p-2"
                    disabled={api.testStatus === 'pending'}
                  >
                    {api.testStatus === 'pending' ? 
                      <Loader2 className="h-4 w-4 animate-spin" /> :
                      <RefreshCw className="h-4 w-4" />
                    }
                  </button>
                  <button
                    onClick={() => setEditingApi(api)}
                    className="btn-ghost p-2"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this API configuration?')) {
                        setApiConfigs(prev => prev.filter(a => a.id !== api.id))
                      }
                    }}
                    className="btn-ghost p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Business Logic Templates</h2>
            <p className="text-muted-foreground">
              Pre-built templates for common business logic patterns
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getLogicTemplates().map((template, index) => (
              <div key={index} className="card-enhanced p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {template.category}
                    </span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(template.content)}
                    className="btn-ghost p-2"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-muted-foreground mb-4">{template.description}</p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm">{template.content}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Import Business Logic</h2>
            <p className="text-muted-foreground">
              Upload JSON files containing business rules and configurations
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="card-enhanced p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
              <p className="text-muted-foreground mb-4">
                Supports JSON files with business rules and API configurations
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                Select Files
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="font-semibold">File Format Example:</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
{`[
  {
    "name": "Custom Rule",
    "category": "pricing",
    "type": "constant",
    "value": 5.99,
    "description": "Custom pricing rule",
    "isActive": true,
    "version": "1.0"
  }
]`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingRule.id === 'new' ? 'Create New Rule' : 'Edit Business Rule'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={editingRule.category}
                    onChange={(e) => setEditingRule(prev => prev ? {...prev, category: e.target.value as any} : null)}
                    className="input w-full"
                  >
                    <option value="pricing">Pricing</option>
                    <option value="operations">Operations</option>
                    <option value="calculations">Calculations</option>
                    <option value="validation">Validation</option>
                    <option value="api">API</option>
                    <option value="workflow">Workflow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={editingRule.type}
                    onChange={(e) => setEditingRule(prev => prev ? {...prev, type: e.target.value as any} : null)}
                    className="input w-full"
                  >
                    <option value="constant">Constant</option>
                    <option value="formula">Formula</option>
                    <option value="conditional">Conditional</option>
                    <option value="api_endpoint">API Endpoint</option>
                    <option value="configuration">Configuration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                {editingRule.type === 'formula' || editingRule.type === 'conditional' ? (
                  <textarea
                    value={editingRule.value.toString()}
                    onChange={(e) => setEditingRule(prev => prev ? {...prev, value: e.target.value} : null)}
                    className="input w-full h-24 font-mono"
                    placeholder="Enter formula or conditional logic..."
                  />
                ) : (
                  <input
                    type={editingRule.type === 'constant' && typeof editingRule.value === 'number' ? 'number' : 'text'}
                    value={editingRule.value.toString()}
                    onChange={(e) => {
                      const value = editingRule.type === 'constant' && !isNaN(Number(e.target.value)) 
                        ? Number(e.target.value) 
                        : e.target.value
                      setEditingRule(prev => prev ? {...prev, value} : null)
                    }}
                    className="input w-full"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editingRule.description}
                  onChange={(e) => setEditingRule(prev => prev ? {...prev, description: e.target.value} : null)}
                  className="input w-full h-20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingRule.isActive}
                  onChange={(e) => setEditingRule(prev => prev ? {...prev, isActive: e.target.checked} : null)}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingRule(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveRule(editingRule)}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit API Modal */}
      {editingApi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingApi.id === 'new' ? 'Add New API' : 'Edit API Configuration'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editingApi.name}
                  onChange={(e) => setEditingApi(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={editingApi.type}
                    onChange={(e) => setEditingApi(prev => prev ? {...prev, type: e.target.value as any} : null)}
                    className="input w-full"
                  >
                    <option value="weather">Weather</option>
                    <option value="ai">AI/ML</option>
                    <option value="mapping">Mapping</option>
                    <option value="payment">Payment</option>
                    <option value="notification">Notification</option>
                    <option value="external">External</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="apiActive"
                    checked={editingApi.isActive}
                    onChange={(e) => setEditingApi(prev => prev ? {...prev, isActive: e.target.checked} : null)}
                    className="rounded"
                  />
                  <label htmlFor="apiActive" className="text-sm font-medium">Active</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Endpoint URL</label>
                <input
                  type="url"
                  value={editingApi.endpoint}
                  onChange={(e) => setEditingApi(prev => prev ? {...prev, endpoint: e.target.value} : null)}
                  className="input w-full"
                  placeholder="https://api.example.com/v1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <input
                  type="password"
                  value={editingApi.apiKey}
                  onChange={(e) => setEditingApi(prev => prev ? {...prev, apiKey: e.target.value} : null)}
                  className="input w-full"
                  placeholder="Enter API key..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rate Limit (per month)</label>
                  <input
                    type="number"
                    value={editingApi.rateLimit || ''}
                    onChange={(e) => setEditingApi(prev => prev ? {...prev, rateLimit: parseInt(e.target.value)} : null)}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Timeout (ms)</label>
                  <input
                    type="number"
                    value={editingApi.timeout || ''}
                    onChange={(e) => setEditingApi(prev => prev ? {...prev, timeout: parseInt(e.target.value)} : null)}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingApi(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveApi(editingApi)}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}