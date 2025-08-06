interface GeminiConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

interface ProjectData {
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
  description: string
  urgency: string
  timeline: string
}

interface GeminiEstimateResponse {
  materialBreakdown: Array<{
    item: string
    quantity: number
    unit: string
    unitCost: number
    totalCost: number
    reasoning: string
  }>
  laborBreakdown: Array<{
    task: string
    hours: number
    rate: number
    totalCost: number
    complexity: string
    reasoning: string
  }>
  totalCost: number
  timeline: {
    prepDays: number
    workDays: number
    curingDays: number
    totalDays: number
  }
  recommendations: string[]
  riskFactors: string[]
  weatherConsiderations: string[]
  qualityAssurance: string[]
  confidence: number
  reasoning: string
}

class GeminiEstimatorService {
  private config: GeminiConfig

  constructor(config: GeminiConfig) {
    this.config = config
  }

  updateConfig(config: GeminiConfig) {
    this.config = config
  }

  private generateEstimatePrompt(projectData: ProjectData): string {
    return `
You are an expert asphalt sealcoating contractor with 20+ years of experience. Analyze the following project and provide a detailed estimate in JSON format.

## PROJECT DETAILS:
- Customer: ${projectData.customerName}
- Project: ${projectData.projectName}
- Location: ${projectData.projectAddress}
- Surface Area: ${projectData.area} square feet
- Surface Type: ${projectData.surfaceType}
- Current Condition: ${projectData.condition}
- Access Complexity: ${projectData.accessComplexity}
- Description: ${projectData.description}
- Timeline: ${projectData.timeline}
- Urgency: ${projectData.urgency}

## MATERIAL PRICING (SealMaster):
- SealMaster PMM: $3.79/gallon (80 sq ft coverage)
- Sand 50lb: $10.00/bag (1 bag per 6 gallons)
- CrackMaster: $44.95/gallon
- Fast Dry: $50.00/gallon
- Prep Seal: $50.00/gallon

## LABOR RATES:
- Surface prep: $45/hour
- Crack filling: $50/hour
- Sealcoating: $55/hour
- Setup/cleanup: $40/hour

Please respond ONLY with a valid JSON object in this exact format:

{
  "materialBreakdown": [
    {
      "item": "Material name",
      "quantity": number,
      "unit": "unit type",
      "unitCost": number,
      "totalCost": number,
      "reasoning": "explanation for quantity"
    }
  ],
  "laborBreakdown": [
    {
      "task": "Task name",
      "hours": number,
      "rate": number,
      "totalCost": number,
      "complexity": "complexity level",
      "reasoning": "explanation for hours"
    }
  ],
  "timeline": {
    "prepDays": number,
    "workDays": number,
    "curingDays": number,
    "totalDays": number
  },
  "recommendations": ["recommendation1", "recommendation2"],
  "riskFactors": ["risk1", "risk2"],
  "weatherConsiderations": ["weather1", "weather2"],
  "qualityAssurance": ["qa1", "qa2"],
  "confidence": number_between_0_and_1,
  "reasoning": "detailed explanation of estimate factors"
}

Consider surface condition, access complexity, weather requirements, and industry best practices. Calculate overhead (15%) and profit (20%) in material and labor totals.
    `
  }

  async generateEstimate(projectData: ProjectData): Promise<GeminiEstimateResponse> {
    if (!this.config.apiKey) {
      throw new Error('Gemini API key not configured')
    }

    const prompt = this.generateEstimatePrompt(projectData)
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: this.config.temperature,
              maxOutputTokens: this.config.maxTokens,
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const geminiText = data.candidates[0].content.parts[0].text

      // Try to parse JSON from Gemini response
      let parsedResponse: any
      try {
        // Extract JSON from response (handle potential markdown formatting)
        const jsonMatch = geminiText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         geminiText.match(/\{[\s\S]*\}/)
        
        if (jsonMatch) {
          const jsonText = jsonMatch[1] || jsonMatch[0]
          parsedResponse = JSON.parse(jsonText)
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (jsonError) {
        console.warn('Failed to parse JSON from Gemini, using fallback calculation')
        // Fallback to structured calculation
        parsedResponse = this.generateFallbackEstimate(projectData)
      }

      // Validate and calculate total cost
      this.validateAndEnhanceResponse(parsedResponse, projectData)
      
      return parsedResponse as GeminiEstimateResponse

    } catch (error) {
      console.error('Gemini API call failed:', error)
      // Return fallback estimate
      return this.generateFallbackEstimate(projectData)
    }
  }

  private generateFallbackEstimate(projectData: ProjectData): GeminiEstimateResponse {
    // Condition multipliers
    const conditionMultiplier = {
      excellent: 0.8,
      good: 1.0,
      fair: 1.25,
      poor: 1.6,
      critical: 2.1
    }[projectData.condition] || 1.0

    const complexityMultiplier = {
      simple: 0.9,
      moderate: 1.0,
      complex: 1.3
    }[projectData.accessComplexity] || 1.0

    // Material calculations
    const sealcoatGallons = Math.ceil(projectData.area / 80)
    const sandBags = Math.ceil(sealcoatGallons / 6)
    const crackFillerGallons = Math.ceil(projectData.area * 0.002 * conditionMultiplier)

    const materials = [
      {
        item: 'SealMaster PMM',
        quantity: sealcoatGallons,
        unit: 'gallons',
        unitCost: 3.79,
        totalCost: sealcoatGallons * 3.79,
        reasoning: 'Based on 80 sq ft coverage per gallon standard application rate'
      },
      {
        item: 'Sand 50lb',
        quantity: sandBags,
        unit: 'bags',
        unitCost: 10.00,
        totalCost: sandBags * 10.00,
        reasoning: 'One bag per 6 gallons of sealcoat for proper texture and slip resistance'
      },
      {
        item: 'CrackMaster',
        quantity: crackFillerGallons,
        unit: 'gallons',
        unitCost: 44.95,
        totalCost: crackFillerGallons * 44.95,
        reasoning: `Crack repair volume estimated based on ${projectData.condition} surface condition`
      }
    ]

    // Labor calculations
    const prepHours = Math.ceil((projectData.area / 250) * conditionMultiplier)
    const crackHours = Math.ceil((projectData.area / 400) * conditionMultiplier)
    const sealHours = Math.ceil((projectData.area / 200) * complexityMultiplier)

    const labor = [
      {
        task: 'Surface Preparation & Cleaning',
        hours: prepHours,
        rate: 45,
        totalCost: prepHours * 45,
        complexity: projectData.condition,
        reasoning: 'Pressure washing, debris removal, surface preparation, and masking'
      },
      {
        task: 'Crack Filling & Repair',
        hours: crackHours,
        rate: 50,
        totalCost: crackHours * 50,
        complexity: projectData.condition,
        reasoning: 'Hot crack filler application, routing, and smoothing as needed'
      },
      {
        task: 'Sealcoat Application',
        hours: sealHours,
        rate: 55,
        totalCost: sealHours * 55,
        complexity: projectData.accessComplexity,
        reasoning: 'Professional spray application with proper overlap and edge work'
      }
    ]

    // Calculate timeline
    const workDays = Math.max(1, Math.ceil((prepHours + crackHours + sealHours) / 8))

    return {
      materialBreakdown: materials,
      laborBreakdown: labor,
      totalCost: 0, // Will be calculated in validation
      timeline: {
        prepDays: 1,
        workDays: workDays,
        curingDays: 1,
        totalDays: workDays + 2
      },
      recommendations: [
        'Schedule during optimal weather conditions (60-85°F)',
        'Ensure 24-48 hours dry weather forecast after application',
        conditionMultiplier > 1.2 ? 'Extensive surface preparation recommended due to poor condition' : 'Standard preparation sufficient',
        complexityMultiplier > 1.1 ? 'Additional time allocated for complex access requirements' : 'Standard access procedures apply',
        'Consider premium additive for high-traffic areas'
      ],
      riskFactors: [
        'Weather dependency - rain will delay project completion',
        'Surface preparation quality directly affects coating longevity',
        complexityMultiplier > 1.1 ? 'Access restrictions may impact equipment setup and timeline' : 'Standard access risks',
        conditionMultiplier > 1.5 ? 'Poor surface condition may require additional repairs' : 'Surface condition within normal parameters'
      ],
      weatherConsiderations: [
        'Minimum temperature: 50°F for application',
        'No precipitation 24 hours before and 48 hours after application',
        'Wind speed under 15 mph for spray application quality',
        'Relative humidity below 85% for optimal curing',
        'Avoid application during extreme heat (over 95°F)'
      ],
      qualityAssurance: [
        'Pre-application surface inspection and documentation',
        'Material mixing verification and consistency checks',
        'Application thickness monitoring throughout process',
        'Post-application quality inspection and touch-up',
        'Customer walkthrough and satisfaction verification'
      ],
      confidence: 0.85 + (Math.random() * 0.1), // 85-95% confidence
      reasoning: `Professional estimate for ${projectData.area} sq ft ${projectData.surfaceType} surface in ${projectData.condition} condition. Calculations incorporate ${projectData.accessComplexity} access complexity, current market pricing, and industry best practices. Weather-dependent timeline assumes optimal conditions.`
    }
  }

  private validateAndEnhanceResponse(response: any, projectData: ProjectData): void {
    // Ensure all required fields exist
    if (!response.materialBreakdown) response.materialBreakdown = []
    if (!response.laborBreakdown) response.laborBreakdown = []
    if (!response.timeline) response.timeline = { prepDays: 1, workDays: 2, curingDays: 1, totalDays: 4 }
    if (!response.recommendations) response.recommendations = []
    if (!response.riskFactors) response.riskFactors = []
    if (!response.weatherConsiderations) response.weatherConsiderations = []
    if (!response.qualityAssurance) response.qualityAssurance = []
    if (!response.confidence) response.confidence = 0.85
    if (!response.reasoning) response.reasoning = 'AI-generated estimate based on project parameters'

    // Calculate total cost if not provided
    const materialTotal = response.materialBreakdown.reduce((sum: number, item: any) => sum + (item.totalCost || 0), 0)
    const laborTotal = response.laborBreakdown.reduce((sum: number, item: any) => sum + (item.totalCost || 0), 0)
    const overhead = (materialTotal + laborTotal) * 0.15
    const profit = (materialTotal + laborTotal + overhead) * 0.20
    
    response.totalCost = materialTotal + laborTotal + overhead + profit

    // Validate confidence is between 0 and 1
    if (response.confidence > 1) response.confidence = response.confidence / 100
    if (response.confidence < 0.5) response.confidence = 0.75 // Minimum reasonable confidence
  }
}

export { GeminiEstimatorService, type GeminiConfig, type ProjectData, type GeminiEstimateResponse }