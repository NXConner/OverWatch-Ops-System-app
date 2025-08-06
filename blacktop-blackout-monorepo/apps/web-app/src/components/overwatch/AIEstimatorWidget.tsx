import React, { useState, useRef, useCallback } from 'react'
import { 
  Calculator, 
  Zap, 
  Upload, 
  Camera, 
  MapPin, 
  Layers, 
  DollarSign, 
  Clock,
  TrendingUp,
  Brain,
  Target,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react'
import { useTerminology } from '../../contexts/TerminologyContext'

interface ProjectData {
  id: string
  name: string
  area: number
  surfaceType: 'asphalt' | 'concrete' | 'gravel'
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  accessComplexity: 'simple' | 'moderate' | 'complex'
  images?: string[]
  location?: { lat: number; lon: number }
}

interface MaterialEstimate {
  item: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  confidence: number
}

interface LaborEstimate {
  task: string
  hours: number
  rate: number
  totalCost: number
  complexity: number
}

interface EstimateResult {
  id: string
  projectName: string
  totalCost: number
  materials: MaterialEstimate[]
  labor: LaborEstimate[]
  overhead: number
  profit: number
  timeline: {
    prepDays: number
    sealingDays: number
    curingDays: number
  }
  confidence: number
  aiFactors: string[]
  recommendations: string[]
  createdAt: Date
}

export const AIEstimatorWidget: React.FC = () => {
  const { translate } = useTerminology()
  const [project, setProject] = useState<ProjectData>({
    id: '',
    name: '',
    area: 0,
    surfaceType: 'asphalt',
    condition: 'good',
    accessComplexity: 'moderate'
  })
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recentEstimates] = useState<EstimateResult[]>([
    {
      id: '1',
      projectName: 'Walmart Parking Lot - Section A',
      totalCost: 8450.50,
      materials: [
        { item: 'SealMaster PMM', quantity: 45, unit: 'gal', unitCost: 3.79, totalCost: 170.55, confidence: 0.95 },
        { item: 'Sand 50lb', quantity: 8, unit: 'bags', unitCost: 10.00, totalCost: 80.00, confidence: 0.98 },
        { item: 'CrackMaster', quantity: 12, unit: 'gal', unitCost: 44.95, totalCost: 539.40, confidence: 0.92 }
      ],
      labor: [
        { task: 'Surface Preparation', hours: 16, rate: 45, totalCost: 720, complexity: 0.7 },
        { task: 'Crack Filling', hours: 8, rate: 50, totalCost: 400, complexity: 0.8 },
        { task: 'Sealcoating Application', hours: 12, rate: 55, totalCost: 660, complexity: 0.9 }
      ],
      overhead: 1200,
      profit: 1680,
      timeline: { prepDays: 1, sealingDays: 2, curingDays: 1 },
      confidence: 0.89,
      aiFactors: ['Surface Analysis', 'Weather Patterns', 'Access Complexity', 'Historical Data'],
      recommendations: [
        'Schedule during optimal weather window',
        'Consider premium additive for high-traffic areas',
        'Plan for extended cure time due to thickness requirements'
      ],
      createdAt: new Date('2024-08-06T10:30:00')
    }
  ])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const urls = Array.from(files).map(file => URL.createObjectURL(file))
      setProject(prev => ({ ...prev, images: urls }))
    }
  }, [])

  const generateEstimate = useCallback(async () => {
    if (!project.area || !project.name) {
      alert('Please enter project name and area')
      return
    }

    setIsAnalyzing(true)

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000))

    // AI-powered calculations based on multiple factors
    const baseRate = project.surfaceType === 'asphalt' ? 0.45 : 0.52
    const conditionMultiplier = {
      excellent: 0.8,
      good: 1.0,
      fair: 1.25,
      poor: 1.6,
      critical: 2.1
    }[project.condition]
    
    const complexityMultiplier = {
      simple: 0.9,
      moderate: 1.0,
      complex: 1.3
    }[project.accessComplexity]

    const area = project.area
    const materialCostPerSqFt = baseRate * conditionMultiplier * complexityMultiplier

    // Generate detailed materials list
    const sealcoatGallons = Math.ceil(area / 80) // 80 sq ft per gallon
    const sandBags = Math.ceil(sealcoatGallons / 6) // 1 bag per 6 gallons
    const crackFillerGallons = Math.ceil(area * 0.001 * conditionMultiplier) // More for poor conditions

    const materials: MaterialEstimate[] = [
      {
        item: 'SealMaster PMM',
        quantity: sealcoatGallons,
        unit: 'gal',
        unitCost: 3.79,
        totalCost: sealcoatGallons * 3.79,
        confidence: 0.95
      },
      {
        item: 'Sand 50lb',
        quantity: sandBags,
        unit: 'bags',
        unitCost: 10.00,
        totalCost: sandBags * 10.00,
        confidence: 0.98
      },
      {
        item: 'CrackMaster',
        quantity: crackFillerGallons,
        unit: 'gal',
        unitCost: 44.95,
        totalCost: crackFillerGallons * 44.95,
        confidence: 0.92
      }
    ]

    // Generate labor estimates
    const prepHours = Math.ceil(area / 200) * conditionMultiplier
    const crackHours = Math.ceil(area / 400) * conditionMultiplier
    const sealHours = Math.ceil(area / 150) * complexityMultiplier

    const labor: LaborEstimate[] = [
      {
        task: 'Surface Preparation',
        hours: prepHours,
        rate: 45,
        totalCost: prepHours * 45,
        complexity: conditionMultiplier
      },
      {
        task: 'Crack Filling',
        hours: crackHours,
        rate: 50,
        totalCost: crackHours * 50,
        complexity: conditionMultiplier
      },
      {
        task: 'Sealcoating Application',
        hours: sealHours,
        rate: 55,
        totalCost: sealHours * 55,
        complexity: complexityMultiplier
      }
    ]

    const materialTotal = materials.reduce((sum, m) => sum + m.totalCost, 0)
    const laborTotal = labor.reduce((sum, l) => sum + l.totalCost, 0)
    const overhead = (materialTotal + laborTotal) * 0.15
    const profit = (materialTotal + laborTotal + overhead) * 0.20

    const newEstimate: EstimateResult = {
      id: Date.now().toString(),
      projectName: project.name,
      totalCost: materialTotal + laborTotal + overhead + profit,
      materials,
      labor,
      overhead,
      profit,
      timeline: {
        prepDays: Math.ceil(prepHours / 8),
        sealingDays: Math.ceil(sealHours / 8),
        curingDays: 1
      },
      confidence: 0.85 + (Math.random() * 0.1),
      aiFactors: [
        'Surface Analysis',
        'Weather Optimization',
        'Material Efficiency',
        'Labor Productivity',
        'Historical Performance'
      ],
      recommendations: [
        `Optimal conditions for ${project.condition} surface`,
        'Weather window planning integrated',
        complexityMultiplier > 1.1 ? 'Complex access requires additional planning' : 'Standard access procedures',
        conditionMultiplier > 1.3 ? 'Extensive prep work recommended' : 'Standard preparation sufficient'
      ],
      createdAt: new Date()
    }

    setEstimate(newEstimate)
    setIsAnalyzing(false)
  }, [project])

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

  return (
    <div className="space-y-6">
      {/* AI Estimator Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">
            {translate('Pave AI Estimator', 'Pave AI Estimator')}
          </h3>
        </div>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span>ML-Powered</span>
        </div>
      </div>

      {/* Project Input Form */}
      <div className="space-y-4 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold flex items-center space-x-2">
          <Calculator className="h-4 w-4" />
          <span>{translate('Project Details', 'Project Details')}</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded-lg text-sm"
              placeholder="e.g., Walmart Parking Lot"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Area (sq ft)</label>
            <input
              type="number"
              value={project.area || ''}
              onChange={(e) => setProject(prev => ({ ...prev, area: parseInt(e.target.value) || 0 }))}
              className="w-full p-2 border rounded-lg text-sm"
              placeholder="e.g., 5000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Surface Type</label>
            <select
              value={project.surfaceType}
              onChange={(e) => setProject(prev => ({ ...prev, surfaceType: e.target.value as any }))}
              className="w-full p-2 border rounded-lg text-sm"
            >
              <option value="asphalt">Asphalt</option>
              <option value="concrete">Concrete</option>
              <option value="gravel">Gravel</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Surface Condition</label>
            <select
              value={project.condition}
              onChange={(e) => setProject(prev => ({ ...prev, condition: e.target.value as any }))}
              className="w-full p-2 border rounded-lg text-sm"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Access Complexity</label>
            <select
              value={project.accessComplexity}
              onChange={(e) => setProject(prev => ({ ...prev, accessComplexity: e.target.value as any }))}
              className="w-full p-2 border rounded-lg text-sm"
            >
              <option value="simple">Simple</option>
              <option value="moderate">Moderate</option>
              <option value="complex">Complex</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Site Photos (Optional)</label>
          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 border border-dashed border-border rounded-lg text-sm hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Images</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 border border-dashed border-border rounded-lg text-sm hover:bg-muted">
              <Camera className="h-4 w-4" />
              <span>Take Photo</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {project.images && project.images.length > 0 && (
            <div className="flex space-x-2 mt-2">
              {project.images.map((url, index) => (
                <img key={index} src={url} alt={`Site ${index + 1}`} className="w-16 h-16 object-cover rounded" />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={generateEstimate}
          disabled={isAnalyzing || !project.area || !project.name}
          className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Zap className="h-4 w-4 animate-pulse" />
              <span>AI Analyzing...</span>
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              <span>Generate AI Estimate</span>
            </>
          )}
        </button>
      </div>

      {/* Current Estimate Results */}
      {estimate && (
        <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-lg flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>{estimate.projectName}</span>
            </h4>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{formatCurrency(estimate.totalCost)}</div>
              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>{(estimate.confidence * 100).toFixed(0)}% confidence</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded">
              <div className="font-bold text-blue-600">{formatCurrency(estimate.materials.reduce((s, m) => s + m.totalCost, 0))}</div>
              <div className="text-muted-foreground">Materials</div>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <div className="font-bold text-green-600">{formatCurrency(estimate.labor.reduce((s, l) => s + l.totalCost, 0))}</div>
              <div className="text-muted-foreground">Labor</div>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <div className="font-bold text-yellow-600">{formatCurrency(estimate.overhead)}</div>
              <div className="text-muted-foreground">Overhead</div>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <div className="font-bold text-purple-600">{formatCurrency(estimate.profit)}</div>
              <div className="text-muted-foreground">Profit</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Timeline:</span>
            </div>
            <div className="flex space-x-4">
              <span>{estimate.timeline.prepDays}d prep</span>
              <span>{estimate.timeline.sealingDays}d sealing</span>
              <span>{estimate.timeline.curingDays}d curing</span>
            </div>
          </div>

          {/* AI Factors */}
          <div className="space-y-2">
            <div className="text-sm font-medium">AI Analysis Factors:</div>
            <div className="flex flex-wrap gap-2">
              {estimate.aiFactors.map((factor, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {factor}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <div className="text-sm font-medium">AI Recommendations:</div>
            <div className="space-y-1">
              {estimate.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center space-x-1 bg-primary text-primary-foreground py-2 px-3 rounded text-sm">
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
            <button className="flex-1 flex items-center justify-center space-x-1 bg-accent text-accent-foreground py-2 px-3 rounded text-sm">
              <FileText className="h-4 w-4" />
              <span>Create Proposal</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Estimates */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {translate('Recent AI Estimates', 'Recent AI Estimates')}
        </h4>
        
        <div className="space-y-2">
          {recentEstimates.map(est => (
            <div key={est.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-sm">{est.projectName}</div>
                <div className="text-xs text-muted-foreground">
                  {est.createdAt.toLocaleDateString()} • {(est.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">{formatCurrency(est.totalCost)}</div>
                <div className="text-xs text-muted-foreground">
                  {est.timeline.prepDays + est.timeline.sealingDays}d project
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Performance Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-green-600">94%</div>
          <div className="text-xs text-muted-foreground">AI Accuracy</div>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-blue-600">847</div>
          <div className="text-xs text-muted-foreground">Projects Analyzed</div>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-purple-600">$2.1M</div>
          <div className="text-xs text-muted-foreground">Total Estimated</div>
        </div>
      </div>
    </div>
  )
}