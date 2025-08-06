import React, { useState, useRef, useCallback } from 'react'
import { 
  Brain, 
  Settings, 
  Save, 
  FileText, 
  Download, 
  Upload,
  Camera,
  MapPin,
  DollarSign,
  Clock,
  Zap,
  Key,
  Check,
  AlertCircle,
  Calculator,
  Users,
  Building2,
  Mail,
  Phone,
  Calendar,
  Hash
} from 'lucide-react'
import { useTerminology } from '../contexts/TerminologyContext'
import { GeminiEstimatorService, type GeminiConfig, type ProjectData, type GeminiEstimateResponse } from '../services/geminiService'

interface ProjectInput {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  projectName: string
  projectAddress: string
  area: number
  surfaceType: string
  condition: string
  accessComplexity: string
  images: File[]
  description: string
  urgency: string
  timeline: string
}

interface GeminiEstimate {
  id: string
  projectInput: ProjectInput
  geminiResponse: GeminiEstimateResponse
  createdAt: Date
  invoiceNumber: string
}

export const GeminiEstimator: React.FC = () => {
  const { translate } = useTerminology()
  const [geminiConfig, setGeminiConfig] = useState<GeminiConfig>({
    apiKey: localStorage.getItem('gemini_api_key') || '',
    model: 'gemini-1.5-pro',
    temperature: 0.3,
    maxTokens: 4000
  })
  
  const [project, setProject] = useState<ProjectInput>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    projectName: '',
    projectAddress: '',
    area: 0,
    surfaceType: 'asphalt',
    condition: 'good',
    accessComplexity: 'moderate',
    images: [],
    description: '',
    urgency: 'normal',
    timeline: 'flexible'
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentEstimate, setCurrentEstimate] = useState<GeminiEstimate | null>(null)
  const [savedEstimates, setSavedEstimates] = useState<GeminiEstimate[]>(() => {
    const saved = localStorage.getItem('gemini_estimates')
    return saved ? JSON.parse(saved) : []
  })
  const [showDetailedInvoice, setShowDetailedInvoice] = useState(true)
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false)
  const [geminiService, setGeminiService] = useState<GeminiEstimatorService | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check API key configuration and initialize service
  React.useEffect(() => {
    setApiKeyConfigured(geminiConfig.apiKey.length > 0)
    if (geminiConfig.apiKey.length > 0) {
      const service = new GeminiEstimatorService(geminiConfig)
      setGeminiService(service)
    } else {
      setGeminiService(null)
    }
  }, [geminiConfig])

  const saveApiKey = useCallback(() => {
    localStorage.setItem('gemini_api_key', geminiConfig.apiKey)
    setApiKeyConfigured(geminiConfig.apiKey.length > 0)
  }, [geminiConfig.apiKey])

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setProject(prev => ({ ...prev, images: Array.from(files) }))
    }
  }, [])



  const generateEstimate = useCallback(async () => {
    if (!apiKeyConfigured || !geminiService) {
      alert('Please configure your Gemini API key first')
      return
    }

    if (!project.customerName || !project.area || !project.projectName) {
      alert('Please fill in customer name, project name, and area')
      return
    }

    setIsAnalyzing(true)

    try {
      // Convert project input to service format
      const projectData: ProjectData = {
        customerName: project.customerName,
        customerEmail: project.customerEmail,
        customerPhone: project.customerPhone,
        customerAddress: project.customerAddress,
        projectName: project.projectName,
        projectAddress: project.projectAddress,
        area: project.area,
        surfaceType: project.surfaceType,
        condition: project.condition,
        accessComplexity: project.accessComplexity,
        description: project.description,
        urgency: project.urgency,
        timeline: project.timeline
      }

      // Generate estimate using Gemini service
      const geminiResponse = await geminiService.generateEstimate(projectData)

      const estimate: GeminiEstimate = {
        id: Date.now().toString(),
        projectInput: project,
        geminiResponse: geminiResponse,
        createdAt: new Date(),
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
      }

      setCurrentEstimate(estimate)
      
    } catch (error) {
      console.error('Gemini API error:', error)
      alert('Failed to generate estimate. Please check your API key and try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }, [project, geminiConfig, apiKeyConfigured])

  const saveEstimate = useCallback(() => {
    if (!currentEstimate) return
    
    const updated = [...savedEstimates, currentEstimate]
    setSavedEstimates(updated)
    localStorage.setItem('gemini_estimates', JSON.stringify(updated))
    alert('Estimate saved successfully!')
  }, [currentEstimate, savedEstimates])

  const generateDetailedInvoice = (estimate: GeminiEstimate) => {
    const materialTotal = estimate.geminiResponse.materialBreakdown.reduce((sum, item) => sum + item.totalCost, 0)
    const laborTotal = estimate.geminiResponse.laborBreakdown.reduce((sum, item) => sum + item.totalCost, 0)
    const overhead = (materialTotal + laborTotal) * 0.15
    const profit = (materialTotal + laborTotal + overhead) * 0.20

    return `
# PROFESSIONAL ESTIMATE - DETAILED
**Blacktop Solutions LLC**
337 Ayers Orchard Road, Stuart, VA 24171
Phone: (276) 555-0123 | Email: info@blacktopsolutions.com

---

## INVOICE #${estimate.invoiceNumber}
**Date:** ${estimate.createdAt.toLocaleDateString()}
**Estimate Valid:** 30 days

### CUSTOMER INFORMATION
**Name:** ${estimate.projectInput.customerName}
**Email:** ${estimate.projectInput.customerEmail}
**Phone:** ${estimate.projectInput.customerPhone}
**Address:** ${estimate.projectInput.customerAddress}

### PROJECT DETAILS
**Project:** ${estimate.projectInput.projectName}
**Location:** ${estimate.projectInput.projectAddress}
**Surface Area:** ${estimate.projectInput.area.toLocaleString()} sq ft
**Surface Type:** ${estimate.projectInput.surfaceType}
**Current Condition:** ${estimate.projectInput.condition}
**Access Complexity:** ${estimate.projectInput.accessComplexity}

---

## MATERIAL BREAKDOWN
${estimate.geminiResponse.materialBreakdown.map(item => `
**${item.item}**
- Quantity: ${item.quantity} ${item.unit}
- Unit Cost: $${item.unitCost.toFixed(2)}
- Total: $${item.totalCost.toFixed(2)}
- Reasoning: ${item.reasoning}
`).join('')}

**Materials Subtotal: $${materialTotal.toFixed(2)}**

---

## LABOR BREAKDOWN
${estimate.geminiResponse.laborBreakdown.map(item => `
**${item.task}**
- Hours: ${item.hours}
- Rate: $${item.rate}/hour
- Total: $${item.totalCost.toFixed(2)}
- Complexity: ${item.complexity}
- Details: ${item.reasoning}
`).join('')}

**Labor Subtotal: $${laborTotal.toFixed(2)}**

---

## PROJECT COSTS
- **Materials:** $${materialTotal.toFixed(2)}
- **Labor:** $${laborTotal.toFixed(2)}
- **Overhead (15%):** $${overhead.toFixed(2)}
- **Profit (20%):** $${profit.toFixed(2)}

### **TOTAL PROJECT COST: $${estimate.geminiResponse.totalCost.toFixed(2)}**

---

## PROJECT TIMELINE
- **Preparation:** ${estimate.geminiResponse.timeline.prepDays} day(s)
- **Application Work:** ${estimate.geminiResponse.timeline.workDays} day(s)
- **Curing Time:** ${estimate.geminiResponse.timeline.curingDays} day(s)
- **Total Duration:** ${estimate.geminiResponse.timeline.totalDays} day(s)

## GEMINI AI RECOMMENDATIONS
${estimate.geminiResponse.recommendations.map(rec => `• ${rec}`).join('\n')}

## QUALITY ASSURANCE
${estimate.geminiResponse.qualityAssurance.map(qa => `• ${qa}`).join('\n')}

## WEATHER CONSIDERATIONS
${estimate.geminiResponse.weatherConsiderations.map(weather => `• ${weather}`).join('\n')}

## RISK FACTORS
${estimate.geminiResponse.riskFactors.map(risk => `• ${risk}`).join('\n')}

---

## TERMS & CONDITIONS
- Estimate valid for 30 days
- 50% deposit required to schedule work
- Final payment due upon completion
- Weather delays may affect timeline
- All work guaranteed for 2 years

**Confidence Level:** ${(estimate.geminiResponse.confidence * 100).toFixed(1)}%
**Generated by:** Gemini Estimator Pro AI
**Reasoning:** ${estimate.geminiResponse.reasoning}

---
*This estimate was generated using Google Gemini AI with professional sealcoating expertise*
    `
  }

  const generateCustomerInvoice = (estimate: GeminiEstimate) => {
    return `
# SEALCOATING ESTIMATE
**Blacktop Solutions LLC**
337 Ayers Orchard Road, Stuart, VA 24171
Phone: (276) 555-0123

---

## ESTIMATE #${estimate.invoiceNumber}
**Date:** ${estimate.createdAt.toLocaleDateString()}

### CUSTOMER
**${estimate.projectInput.customerName}**
${estimate.projectInput.customerAddress}
Phone: ${estimate.projectInput.customerPhone}
Email: ${estimate.projectInput.customerEmail}

### PROJECT
**${estimate.projectInput.projectName}**
Location: ${estimate.projectInput.projectAddress}
Area: ${estimate.projectInput.area.toLocaleString()} square feet

---

## SERVICES INCLUDED

### Sealcoating Application
- Professional surface preparation
- Hot crack filling and repair
- Premium sealcoat application
- Quality materials (SealMaster)
- Professional equipment and crew

### Project Timeline
**Estimated Duration:** ${estimate.geminiResponse.timeline.totalDays} days
- Preparation and setup
- Surface cleaning and crack repair
- Sealcoat application
- Curing and cleanup

---

## INVESTMENT

### **Total Project Cost: $${estimate.geminiResponse.totalCost.toFixed(2)}**

*Includes all materials, labor, and equipment*

---

## WHAT TO EXPECT

✓ **Professional crew** with 20+ years experience
✓ **Premium materials** for lasting protection
✓ **Weather optimization** for best results
✓ **2-year guarantee** on workmanship
✓ **Complete cleanup** when finished

## NEXT STEPS

1. **Accept Estimate** - Valid for 30 days
2. **Schedule Work** - $${(estimate.geminiResponse.totalCost * 0.5).toFixed(2)} deposit to begin
3. **Weather Coordination** - We'll monitor conditions
4. **Professional Results** - Enhance and protect your investment

---

## OPTIMAL CONDITIONS
We'll schedule your project during ideal weather:
• Temperature between 60-85°F
• No rain for 24+ hours before/after
• Low wind for even application
• Perfect timing for your schedule

**Questions?** Call us at (276) 555-0123

---
*Estimate generated with AI-powered precision*
    `
  }

  const downloadInvoice = (estimate: GeminiEstimate, detailed: boolean = true) => {
    const content = detailed ? generateDetailedInvoice(estimate) : generateCustomerInvoice(estimate)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${detailed ? 'detailed' : 'customer'}_estimate_${estimate.invoiceNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Gemini Estimator Pro</h1>
            <Zap className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-muted-foreground">AI-Powered Professional Sealcoating Estimates</p>
        </div>

        {/* API Configuration */}
        <div className="card-enhanced p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Google Gemini Configuration</h2>
            {apiKeyConfigured && <Check className="h-5 w-5 text-green-500" />}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Key className="h-4 w-4 inline mr-1" />
                Gemini API Key
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={geminiConfig.apiKey}
                  onChange={(e) => setGeminiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="flex-1 p-3 border rounded-lg"
                  placeholder="Enter your Gemini API key"
                />
                <button
                  onClick={saveApiKey}
                  className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Save
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <select
                value={geminiConfig.model}
                onChange={(e) => setGeminiConfig(prev => ({ ...prev, model: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              >
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Project Input Form */}
        <div className="card-enhanced p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Project Details</span>
          </h2>
          
          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Customer Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={project.customerName}
                onChange={(e) => setProject(prev => ({ ...prev, customerName: e.target.value }))}
                className="p-3 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Customer Email"
                value={project.customerEmail}
                onChange={(e) => setProject(prev => ({ ...prev, customerEmail: e.target.value }))}
                className="p-3 border rounded-lg"
              />
              <input
                type="tel"
                placeholder="Customer Phone"
                value={project.customerPhone}
                onChange={(e) => setProject(prev => ({ ...prev, customerPhone: e.target.value }))}
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Customer Address"
                value={project.customerAddress}
                onChange={(e) => setProject(prev => ({ ...prev, customerAddress: e.target.value }))}
                className="p-3 border rounded-lg"
              />
            </div>
          </div>

          {/* Project Information */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Project Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Project Name"
                value={project.projectName}
                onChange={(e) => setProject(prev => ({ ...prev, projectName: e.target.value }))}
                className="p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Project Address"
                value={project.projectAddress}
                onChange={(e) => setProject(prev => ({ ...prev, projectAddress: e.target.value }))}
                className="p-3 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Area (sq ft)"
                value={project.area || ''}
                onChange={(e) => setProject(prev => ({ ...prev, area: parseInt(e.target.value) || 0 }))}
                className="p-3 border rounded-lg"
              />
              <select
                value={project.surfaceType}
                onChange={(e) => setProject(prev => ({ ...prev, surfaceType: e.target.value }))}
                className="p-3 border rounded-lg"
              >
                <option value="asphalt">Asphalt</option>
                <option value="concrete">Concrete</option>
                <option value="gravel">Gravel</option>
              </select>
              <select
                value={project.condition}
                onChange={(e) => setProject(prev => ({ ...prev, condition: e.target.value }))}
                className="p-3 border rounded-lg"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={project.accessComplexity}
                onChange={(e) => setProject(prev => ({ ...prev, accessComplexity: e.target.value }))}
                className="p-3 border rounded-lg"
              >
                <option value="simple">Simple Access</option>
                <option value="moderate">Moderate Access</option>
                <option value="complex">Complex Access</option>
              </select>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                placeholder="Project Description"
                value={project.description}
                onChange={(e) => setProject(prev => ({ ...prev, description: e.target.value }))}
                className="p-3 border rounded-lg h-24"
              />
              <div className="space-y-4">
                <select
                  value={project.urgency}
                  onChange={(e) => setProject(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="low">Low Urgency</option>
                  <option value="normal">Normal Urgency</option>
                  <option value="high">High Urgency</option>
                  <option value="emergency">Emergency</option>
                </select>
                <select
                  value={project.timeline}
                  onChange={(e) => setProject(prev => ({ ...prev, timeline: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="flexible">Flexible Timeline</option>
                  <option value="asap">ASAP</option>
                  <option value="scheduled">Specific Date</option>
                  <option value="seasonal">Seasonal Work</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Site Photos</h3>
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 border border-dashed border-border rounded-lg hover:bg-muted"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Photos</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-dashed border-border rounded-lg hover:bg-muted">
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
            {project.images.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {project.images.length} image(s) selected
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={generateEstimate}
            disabled={isAnalyzing || !apiKeyConfigured}
            className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground py-4 px-6 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Brain className="h-5 w-5 animate-pulse" />
                <span>Gemini AI Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                <span>Generate Gemini Estimate</span>
              </>
            )}
          </button>
        </div>

        {/* Current Estimate Results */}
        {currentEstimate && (
          <div className="card-enhanced p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-primary" />
                <span>Gemini AI Estimate Results</span>
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Confidence: {(currentEstimate.geminiResponse.confidence * 100).toFixed(1)}%
                </span>
                <button
                  onClick={saveEstimate}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  ${currentEstimate.geminiResponse.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Project Investment
                </div>
              </div>
            </div>

            {/* Invoice Templates */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Invoice Templates</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDetailedInvoice(true)}
                    className={`px-3 py-2 rounded text-sm ${showDetailedInvoice ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    Detailed
                  </button>
                  <button
                    onClick={() => setShowDetailedInvoice(false)}
                    className={`px-3 py-2 rounded text-sm ${!showDetailedInvoice ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    Customer
                  </button>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">
                  {showDetailedInvoice 
                    ? generateDetailedInvoice(currentEstimate)
                    : generateCustomerInvoice(currentEstimate)
                  }
                </pre>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => downloadInvoice(currentEstimate, true)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Detailed</span>
                </button>
                <button
                  onClick={() => downloadInvoice(currentEstimate, false)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Customer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Estimates */}
        {savedEstimates.length > 0 && (
          <div className="card-enhanced p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Save className="h-5 w-5 text-primary" />
              <span>Saved Gemini Estimates</span>
            </h2>
            <div className="space-y-3">
              {savedEstimates.map(estimate => (
                <div key={estimate.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{estimate.projectInput.projectName}</div>
                    <div className="text-sm text-muted-foreground">
                      {estimate.projectInput.customerName} • {estimate.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      ${estimate.geminiResponse.totalCost.toFixed(2)}
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => downloadInvoice(estimate, true)}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Detailed
                      </button>
                      <button
                        onClick={() => downloadInvoice(estimate, false)}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Customer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}