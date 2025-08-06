import React, { useState, useEffect } from 'react'
import { 
  Calculator, 
  MapPin, 
  DollarSign, 
  Truck, 
  AlertTriangle, 
  FileText, 
  Download,
  Save,
  Settings,
  Weight,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Info
} from 'lucide-react'
import { useTerminology } from '../contexts/TerminologyContext'
import { useAuth } from '../contexts/AuthContext'

// API Service for estimation
class EstimationAPI {
  private baseURL = '/api/estimation'

  async generateEstimate(projectDetails: ProjectDetails): Promise<EstimationResult> {
    const response = await fetch(`${this.baseURL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(projectDetails)
    })

    if (!response.ok) {
      throw new Error('Failed to generate estimate')
    }

    const result = await response.json()
    return result.data
  }

  async getBusinessConfig(): Promise<BusinessConfig> {
    const response = await fetch(`${this.baseURL}/business-config`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch business config')
    }

    const result = await response.json()
    return result.data
  }

  async quickCalculate(calculationType: string, parameters: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/quick-calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ calculationType, parameters })
    })

    if (!response.ok) {
      throw new Error('Quick calculation failed')
    }

    const result = await response.json()
    return result.data
  }

  async exportPDF(estimate: EstimationResult, format: string = 'standard'): Promise<any> {
    const response = await fetch(`${this.baseURL}/export-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ estimate, format })
    })

    if (!response.ok) {
      throw new Error('PDF export failed')
    }

    const result = await response.json()
    return result.data
  }
}

interface ProjectDetails {
  projectType: 'sealcoating' | 'crackfilling' | 'patching' | 'linestriping' | 'combination'
  location: {
    address: string
    distanceFromBase?: number
  }
  sealcoating?: {
    squareFootage: number
    condition: 'good' | 'fair' | 'poor' | 'heavily_oxidized'
    oilSpots: boolean
    oilSpotArea?: number
  }
  crackFilling?: {
    linearFootage: number
    crackSeverity: 'light' | 'moderate' | 'severe'
    requiresSandFill: boolean
  }
  patching?: {
    squareFootage: number
    patchType: 'hot_mix' | 'cold_patch'
    thickness: number
  }
  lineStriping?: {
    standardStalls: number
    doubleStalls: number
    handicapStalls: number
    customStencils: number
    crosswalks: number
    restripe: boolean
  }
  timeline: {
    startDate: string
    estimatedDays: number
  }
  weatherConsiderations: boolean
}

interface EstimationResult {
  projectSummary: {
    description: string
    totalCost: number
    timeline: string
    validUntil: string
  }
  breakdown: {
    materials: any
    labor: any
    equipment: any
    fuel: any
    mobilization: number
    subtotal: number
    overhead: number
    profit: number
    total: number
  }
  weightAnalysis?: any
  alternatives: {
    withMarkup25: any
    roundedUp: any
  }
  recommendations: string[]
  disclaimers: string[]
}

interface BusinessConfig {
  businessConfig: any
  materialCosts: any
  applicationRates: any
  lastUpdated: string
}

const estimationAPI = new EstimationAPI()

export const AsphaltEstimator: React.FC = () => {
  const { translate } = useTerminology()
  const { user } = useAuth()
  
  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [project, setProject] = useState<ProjectDetails>({
    projectType: 'sealcoating',
    location: { address: '' },
    timeline: { 
      startDate: new Date().toISOString().split('T')[0], 
      estimatedDays: 1 
    },
    weatherConsiderations: true
  })
  
  const [estimate, setEstimate] = useState<EstimationResult | null>(null)
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [quickCalcResults, setQuickCalcResults] = useState<any>(null)
  const [savedEstimates, setSavedEstimates] = useState<EstimationResult[]>([])

  // Load business configuration on mount
  useEffect(() => {
    const loadBusinessConfig = async () => {
      try {
        const config = await estimationAPI.getBusinessConfig()
        setBusinessConfig(config)
      } catch (error) {
        console.error('Failed to load business config:', error)
      }
    }
    loadBusinessConfig()
  }, [])

  // Load saved estimates
  useEffect(() => {
    const saved = localStorage.getItem('asphalt_estimates')
    if (saved) {
      setSavedEstimates(JSON.parse(saved))
    }
  }, [])

  const updateProject = (updates: Partial<ProjectDetails>) => {
    setProject(prev => ({ ...prev, ...updates }))
  }

  const handleStepNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleStepPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateEstimate = async () => {
    setIsCalculating(true)
    try {
      const result = await estimationAPI.generateEstimate(project)
      setEstimate(result)
      setCurrentStep(4) // Go to results step
    } catch (error) {
      console.error('Estimation failed:', error)
      alert('Failed to generate estimate. Please check your inputs and try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  const saveEstimate = () => {
    if (estimate) {
      const newSaved = [...savedEstimates, estimate]
      setSavedEstimates(newSaved)
      localStorage.setItem('asphalt_estimates', JSON.stringify(newSaved))
      alert('Estimate saved successfully!')
    }
  }

  const exportToPDF = async (format: string = 'standard') => {
    if (!estimate) return
    
    try {
      const pdfData = await estimationAPI.exportPDF(estimate, format)
      // In a real implementation, trigger PDF download
      alert('PDF export functionality would trigger download here')
      console.log('PDF Data:', pdfData)
    } catch (error) {
      console.error('PDF export failed:', error)
    }
  }

  const performQuickCalculation = async (type: string, params: any) => {
    try {
      const result = await estimationAPI.quickCalculate(type, params)
      setQuickCalcResults(result)
    } catch (error) {
      console.error('Quick calculation failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-100">
      {/* Header */}
      <div className="bg-slate-900 border-b border-cyan-800/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-cyan-100">
                {translate('Asphalt Paving Estimator')}
              </h1>
              <p className="text-slate-400">
                Virginia-based professional estimation system
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-lg p-6 border border-cyan-800/30">
              <h2 className="text-lg font-semibold text-cyan-100 mb-4">
                Estimation Steps
              </h2>
              
              <div className="space-y-3">
                {[
                  { step: 1, title: 'Project Type', icon: Settings },
                  { step: 2, title: 'Project Details', icon: MapPin },
                  { step: 3, title: 'Review & Calculate', icon: Calculator },
                  { step: 4, title: 'Results & Export', icon: FileText }
                ].map(({ step, title, icon: Icon }) => (
                  <div
                    key={step}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      currentStep === step
                        ? 'bg-cyan-900/30 border-cyan-600 text-cyan-100'
                        : currentStep > step
                        ? 'bg-green-900/20 border-green-600 text-green-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                    onClick={() => setCurrentStep(step)}
                  >
                    {currentStep > step ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                    <span className="font-medium">{title}</span>
                  </div>
                ))}
              </div>

              {businessConfig && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-sm font-medium text-cyan-100 mb-2">
                    Business Info
                  </h3>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>{businessConfig.businessConfig.address}</div>
                    <div>Material costs updated: {new Date(businessConfig.lastUpdated).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 rounded-lg border border-cyan-800/30">
              
              {/* Step 1: Project Type Selection */}
              {currentStep === 1 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-cyan-100 mb-6">
                    Select Project Type
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { value: 'sealcoating', label: 'Sealcoating', icon: '🛣️', desc: 'Asphalt sealing and protection' },
                      { value: 'crackfilling', label: 'Crack Filling', icon: '🔧', desc: 'Hot pour crack repair' },
                      { value: 'patching', label: 'Patching', icon: '🛠️', desc: 'Hot/cold asphalt patching' },
                      { value: 'linestriping', label: 'Line Striping', icon: '🎨', desc: 'Parking lot markings' },
                      { value: 'combination', label: 'Combination', icon: '🏗️', desc: 'Multiple services' }
                    ].map(({ value, label, icon, desc }) => (
                      <div
                        key={value}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          project.projectType === value
                            ? 'border-cyan-500 bg-cyan-900/20'
                            : 'border-slate-700 bg-slate-800 hover:border-cyan-700'
                        }`}
                        onClick={() => updateProject({ projectType: value as any })}
                      >
                        <div className="text-2xl mb-2">{icon}</div>
                        <h3 className="font-semibold text-cyan-100">{label}</h3>
                        <p className="text-sm text-slate-400 mt-1">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={handleStepNext}
                      className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Project Details */}
              {currentStep === 2 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-cyan-100 mb-6">
                    Project Details
                  </h2>

                  {/* Location & Timeline */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-cyan-100 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Project Address
                        </label>
                        <input
                          type="text"
                          value={project.location.address}
                          onChange={(e) => updateProject({ 
                            location: { ...project.location, address: e.target.value }
                          })}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                          placeholder="Enter project address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-cyan-100 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={project.timeline.startDate}
                          onChange={(e) => updateProject({
                            timeline: { ...project.timeline, startDate: e.target.value }
                          })}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-cyan-100 mb-2">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Estimated Days
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={project.timeline.estimatedDays}
                          onChange={(e) => updateProject({
                            timeline: { ...project.timeline, estimatedDays: parseInt(e.target.value) }
                          })}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center pt-8">
                        <input
                          type="checkbox"
                          id="weather"
                          checked={project.weatherConsiderations}
                          onChange={(e) => updateProject({ weatherConsiderations: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="weather" className="text-sm text-cyan-100">
                          Include weather considerations
                        </label>
                      </div>
                    </div>

                    {/* Service-specific inputs */}
                    {renderServiceSpecificInputs()}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handleStepPrev}
                      className="bg-slate-700 hover:bg-slate-600 text-cyan-100 px-6 py-2 rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleStepNext}
                      className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Calculate */}
              {currentStep === 3 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-cyan-100 mb-6">
                    Review & Calculate
                  </h2>

                  {renderProjectSummary()}

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handleStepPrev}
                      className="bg-slate-700 hover:bg-slate-600 text-cyan-100 px-6 py-2 rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={generateEstimate}
                      disabled={isCalculating}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white px-8 py-2 rounded-lg transition-colors"
                    >
                      {isCalculating ? (
                        <>Calculating...</>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4" />
                          Generate Estimate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Results */}
              {currentStep === 4 && estimate && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-cyan-100 mb-6">
                    Estimation Results
                  </h2>

                  {renderEstimationResults()}

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handleStepPrev}
                      className="bg-slate-700 hover:bg-slate-600 text-cyan-100 px-6 py-2 rounded-lg transition-colors"
                    >
                      Modify Project
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={saveEstimate}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => exportToPDF('detailed')}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Export PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Helper render functions
  function renderServiceSpecificInputs() {
    return (
      <div className="space-y-6 mt-6">
        {/* Sealcoating inputs */}
        {(project.projectType === 'sealcoating' || project.projectType === 'combination') && (
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-cyan-100 mb-4">Sealcoating Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">
                  Square Footage
                </label>
                <input
                  type="number"
                  min="100"
                  value={project.sealcoating?.squareFootage || ''}
                  onChange={(e) => updateProject({
                    sealcoating: { 
                      ...project.sealcoating, 
                      squareFootage: parseInt(e.target.value) || 0,
                      condition: project.sealcoating?.condition || 'good',
                      oilSpots: project.sealcoating?.oilSpots || false
                    }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g., 5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">
                  Surface Condition
                </label>
                <select
                  value={project.sealcoating?.condition || 'good'}
                  onChange={(e) => updateProject({
                    sealcoating: { 
                      ...project.sealcoating,
                      squareFootage: project.sealcoating?.squareFootage || 0,
                      condition: e.target.value as any,
                      oilSpots: project.sealcoating?.oilSpots || false
                    }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="heavily_oxidized">Heavily Oxidized</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={project.sealcoating?.oilSpots || false}
                  onChange={(e) => updateProject({
                    sealcoating: { 
                      ...project.sealcoating,
                      squareFootage: project.sealcoating?.squareFootage || 0,
                      condition: project.sealcoating?.condition || 'good',
                      oilSpots: e.target.checked
                    }
                  })}
                  className="mr-2"
                />
                <span className="text-sm text-cyan-100">Oil spots present requiring prep seal</span>
              </label>
              {project.sealcoating?.oilSpots && (
                <input
                  type="number"
                  min="0"
                  value={project.sealcoating?.oilSpotArea || ''}
                  onChange={(e) => updateProject({
                    sealcoating: { 
                      ...project.sealcoating,
                      oilSpotArea: parseInt(e.target.value) || 0
                    }
                  })}
                  className="mt-2 w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="Oil spot area (sq ft)"
                />
              )}
            </div>
          </div>
        )}

        {/* Crack filling inputs */}
        {(project.projectType === 'crackfilling' || project.projectType === 'combination') && (
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-cyan-100 mb-4">Crack Filling Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">
                  Linear Footage of Cracks
                </label>
                <input
                  type="number"
                  min="1"
                  value={project.crackFilling?.linearFootage || ''}
                  onChange={(e) => updateProject({
                    crackFilling: { 
                      ...project.crackFilling,
                      linearFootage: parseInt(e.target.value) || 0,
                      crackSeverity: project.crackFilling?.crackSeverity || 'moderate',
                      requiresSandFill: project.crackFilling?.requiresSandFill || false
                    }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">
                  Crack Severity
                </label>
                <select
                  value={project.crackFilling?.crackSeverity || 'moderate'}
                  onChange={(e) => updateProject({
                    crackFilling: { 
                      ...project.crackFilling,
                      linearFootage: project.crackFilling?.linearFootage || 0,
                      crackSeverity: e.target.value as any,
                      requiresSandFill: project.crackFilling?.requiresSandFill || false
                    }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={project.crackFilling?.requiresSandFill || false}
                  onChange={(e) => updateProject({
                    crackFilling: { 
                      ...project.crackFilling,
                      linearFootage: project.crackFilling?.linearFootage || 0,
                      crackSeverity: project.crackFilling?.crackSeverity || 'moderate',
                      requiresSandFill: e.target.checked
                    }
                  })}
                  className="mr-2"
                />
                <span className="text-sm text-cyan-100">Deep cracks requiring sand fill</span>
              </label>
            </div>
          </div>
        )}

        {/* Add similar sections for patching and line striping */}
        {(project.projectType === 'patching' || project.projectType === 'combination') && (
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-cyan-100 mb-4">Patching Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">
                  Square Footage
                </label>
                <input
                  type="number"
                  min="1"
                  value={project.patching?.squareFootage || ''}
                  onChange={(e) => updateProject({
                    patching: { 
                      ...project.patching,
                      squareFootage: parseInt(e.target.value) || 0,
                      patchType: project.patching?.patchType || 'hot_mix',
                      thickness: project.patching?.thickness || 2
                    }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">
                  Patch Type
                </label>
                <select
                  value={project.patching?.patchType || 'hot_mix'}
                  onChange={(e) => updateProject({
                    patching: { 
                      ...project.patching,
                      squareFootage: project.patching?.squareFootage || 0,
                      patchType: e.target.value as any,
                      thickness: project.patching?.thickness || 2
                    }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="hot_mix">Hot Mix</option>
                  <option value="cold_patch">Cold Patch</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">
                  Thickness (inches)
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={project.patching?.thickness || 2}
                  onChange={(e) => updateProject({
                    patching: { 
                      ...project.patching,
                      squareFootage: project.patching?.squareFootage || 0,
                      patchType: project.patching?.patchType || 'hot_mix',
                      thickness: parseInt(e.target.value) || 2
                    }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Line striping inputs */}
        {(project.projectType === 'linestriping' || project.projectType === 'combination') && (
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-cyan-100 mb-4">Line Striping Details</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">
                  Standard Stalls
                </label>
                <input
                  type="number"
                  min="0"
                  value={project.lineStriping?.standardStalls || ''}
                  onChange={(e) => updateProject({
                    lineStriping: { 
                      ...project.lineStriping,
                      standardStalls: parseInt(e.target.value) || 0,
                      doubleStalls: project.lineStriping?.doubleStalls || 0,
                      handicapStalls: project.lineStriping?.handicapStalls || 0,
                      customStencils: project.lineStriping?.customStencils || 0,
                      crosswalks: project.lineStriping?.crosswalks || 0,
                      restripe: project.lineStriping?.restripe || false
                    }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">
                  Double Stalls
                </label>
                <input
                  type="number"
                  min="0"
                  value={project.lineStriping?.doubleStalls || ''}
                  onChange={(e) => updateProject({
                    lineStriping: { 
                      ...project.lineStriping,
                      standardStalls: project.lineStriping?.standardStalls || 0,
                      doubleStalls: parseInt(e.target.value) || 0,
                      handicapStalls: project.lineStriping?.handicapStalls || 0,
                      customStencils: project.lineStriping?.customStencils || 0,
                      crosswalks: project.lineStriping?.crosswalks || 0,
                      restripe: project.lineStriping?.restripe || false
                    }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">
                  Handicap Stalls
                </label>
                <input
                  type="number"
                  min="0"
                  value={project.lineStriping?.handicapStalls || ''}
                  onChange={(e) => updateProject({
                    lineStriping: { 
                      ...project.lineStriping,
                      standardStalls: project.lineStriping?.standardStalls || 0,
                      doubleStalls: project.lineStriping?.doubleStalls || 0,
                      handicapStalls: parseInt(e.target.value) || 0,
                      customStencils: project.lineStriping?.customStencils || 0,
                      crosswalks: project.lineStriping?.crosswalks || 0,
                      restripe: project.lineStriping?.restripe || false
                    }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">
                  Crosswalks
                </label>
                <input
                  type="number"
                  min="0"
                  value={project.lineStriping?.crosswalks || ''}
                  onChange={(e) => updateProject({
                    lineStriping: { 
                      ...project.lineStriping,
                      standardStalls: project.lineStriping?.standardStalls || 0,
                      doubleStalls: project.lineStriping?.doubleStalls || 0,
                      handicapStalls: project.lineStriping?.handicapStalls || 0,
                      customStencils: project.lineStriping?.customStencils || 0,
                      crosswalks: parseInt(e.target.value) || 0,
                      restripe: project.lineStriping?.restripe || false
                    }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-cyan-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={project.lineStriping?.restripe || false}
                  onChange={(e) => updateProject({
                    lineStriping: { 
                      ...project.lineStriping,
                      standardStalls: project.lineStriping?.standardStalls || 0,
                      doubleStalls: project.lineStriping?.doubleStalls || 0,
                      handicapStalls: project.lineStriping?.handicapStalls || 0,
                      customStencils: project.lineStriping?.customStencils || 0,
                      crosswalks: project.lineStriping?.crosswalks || 0,
                      restripe: e.target.checked
                    }
                  })}
                  className="mr-2"
                />
                <span className="text-sm text-cyan-100">This is a re-striping project (existing layout)</span>
              </label>
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderProjectSummary() {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-cyan-100 mb-4">Project Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Project Type:</span>
            <span className="text-cyan-100 capitalize">{project.projectType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Location:</span>
            <span className="text-cyan-100">{project.location.address || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Timeline:</span>
            <span className="text-cyan-100">{project.timeline.estimatedDays} day(s) starting {project.timeline.startDate}</span>
          </div>
          
          {project.sealcoating && (
            <div className="border-t border-slate-700 pt-3">
              <div className="text-cyan-100 font-medium mb-2">Sealcoating:</div>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Area:</span>
                  <span className="text-cyan-100">{project.sealcoating.squareFootage.toLocaleString()} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Condition:</span>
                  <span className="text-cyan-100 capitalize">{project.sealcoating.condition}</span>
                </div>
                {project.sealcoating.oilSpots && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Oil Spot Area:</span>
                    <span className="text-cyan-100">{project.sealcoating.oilSpotArea} sq ft</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {project.crackFilling && (
            <div className="border-t border-slate-700 pt-3">
              <div className="text-cyan-100 font-medium mb-2">Crack Filling:</div>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Linear Feet:</span>
                  <span className="text-cyan-100">{project.crackFilling.linearFootage.toLocaleString()} ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Severity:</span>
                  <span className="text-cyan-100 capitalize">{project.crackFilling.crackSeverity}</span>
                </div>
              </div>
            </div>
          )}

          {project.patching && (
            <div className="border-t border-slate-700 pt-3">
              <div className="text-cyan-100 font-medium mb-2">Patching:</div>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Area:</span>
                  <span className="text-cyan-100">{project.patching.squareFootage.toLocaleString()} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-cyan-100">{project.patching.patchType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thickness:</span>
                  <span className="text-cyan-100">{project.patching.thickness}"</span>
                </div>
              </div>
            </div>
          )}

          {project.lineStriping && (
            <div className="border-t border-slate-700 pt-3">
              <div className="text-cyan-100 font-medium mb-2">Line Striping:</div>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Standard Stalls:</span>
                  <span className="text-cyan-100">{project.lineStriping.standardStalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Double Stalls:</span>
                  <span className="text-cyan-100">{project.lineStriping.doubleStalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Handicap Stalls:</span>
                  <span className="text-cyan-100">{project.lineStriping.handicapStalls}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderEstimationResults() {
    if (!estimate) return null

    return (
      <div className="space-y-6">
        {/* Project Summary */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-cyan-100 mb-4">Project Summary</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                ${estimate.projectSummary.totalCost.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-cyan-100">
                {estimate.projectSummary.timeline}
              </div>
              <div className="text-sm text-slate-400">Timeline</div>
            </div>
            <div className="text-center">
              <div className="text-lg text-cyan-100">
                {estimate.projectSummary.validUntil}
              </div>
              <div className="text-sm text-slate-400">Valid Until</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-300">
            {estimate.projectSummary.description}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-100 mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Materials</span>
              <span className="text-cyan-100">${estimate.breakdown.materials.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Labor</span>
              <span className="text-cyan-100">${estimate.breakdown.labor.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Equipment</span>
              <span className="text-cyan-100">${estimate.breakdown.equipment.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fuel & Transportation</span>
              <span className="text-cyan-100">${estimate.breakdown.fuel.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mobilization</span>
              <span className="text-cyan-100">${estimate.breakdown.mobilization.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-700 pt-2">
              <div className="flex justify-between font-medium">
                <span className="text-slate-300">Subtotal</span>
                <span className="text-cyan-100">${estimate.breakdown.subtotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Overhead (15%)</span>
              <span className="text-cyan-100">${estimate.breakdown.overhead.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Profit (20%)</span>
              <span className="text-cyan-100">${estimate.breakdown.profit.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-700 pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-cyan-100">Total</span>
                <span className="text-green-400">${estimate.breakdown.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Analysis */}
        {estimate.weightAnalysis && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <Weight className="w-5 h-5" />
              Weight Analysis
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-slate-400">Vehicle</div>
                <div className="text-cyan-100">{estimate.weightAnalysis.vehicleWeight.toLocaleString()} lbs</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Equipment</div>
                <div className="text-cyan-100">{estimate.weightAnalysis.equipmentWeight.toLocaleString()} lbs</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Total Weight</div>
                <div className={`font-semibold ${estimate.weightAnalysis.withinLimits ? 'text-green-400' : 'text-red-400'}`}>
                  {estimate.weightAnalysis.totalWeight.toLocaleString()} lbs
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Safety Margin</div>
                <div className={`font-semibold ${estimate.weightAnalysis.safetyMargin > 10 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {estimate.weightAnalysis.safetyMargin.toFixed(1)}%
                </div>
              </div>
            </div>
            {estimate.weightAnalysis.warnings.length > 0 && (
              <div className="bg-red-900/20 border border-red-600 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Weight Warnings
                </div>
                {estimate.weightAnalysis.warnings.map((warning: string, index: number) => (
                  <div key={index} className="text-sm text-red-300">{warning}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alternative Pricing */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-100 mb-4">Alternative Pricing</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-700 rounded p-4">
              <div className="font-medium text-cyan-100 mb-2">25% Markup</div>
              <div className="text-2xl font-bold text-green-400">
                ${estimate.alternatives.withMarkup25.total.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-700 rounded p-4">
              <div className="font-medium text-cyan-100 mb-2">Rounded Up + 25%</div>
              <div className="text-2xl font-bold text-green-400">
                ${estimate.alternatives.roundedUp.total.toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">
                {estimate.alternatives.roundedUp.markupPercentage.toFixed(1)}% total markup
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {estimate.recommendations.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {estimate.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimers */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-100 mb-4">Terms & Conditions</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            {estimate.disclaimers.map((disclaimer, index) => (
              <li key={index}>• {disclaimer}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}