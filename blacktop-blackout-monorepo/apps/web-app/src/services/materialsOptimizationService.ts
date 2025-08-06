interface MaterialRequirement {
  material: string
  quantity: number
  unit: string
  cost: number
  category: 'primary' | 'additive' | 'equipment' | 'safety'
}

interface OptimizationFactors {
  projectArea: number
  surfaceCondition: 'excellent' | 'good' | 'fair' | 'poor'
  weatherConditions: {
    temperature: number
    humidity: number
    windSpeed: number
  }
  applicationMethod: 'spray' | 'squeegee' | 'brush'
  qualityLevel: 'basic' | 'premium' | 'commercial'
}

interface OptimizationResult {
  materials: MaterialRequirement[]
  totalCost: number
  estimatedWaste: number
  recommendations: string[]
  compliance: {
    osha: boolean
    epa: boolean
    local: boolean
    issues: string[]
  }
  qualityScore: number
  efficiency: {
    coverage: number
    laborHours: number
    equipmentNeeded: string[]
  }
}

export class MaterialsOptimizationService {
  private readonly baseCoverageRates = {
    spray: 85, // sq ft per gallon
    squeegee: 80,
    brush: 75
  }

  private readonly qualityAdjustments = {
    basic: { coverage: 1.0, cost: 1.0, quality: 75 },
    premium: { coverage: 0.9, cost: 1.2, quality: 90 },
    commercial: { coverage: 0.85, cost: 1.4, quality: 95 }
  }

  private readonly conditionAdjustments = {
    excellent: { coverage: 1.0, preparation: 1.0 },
    good: { coverage: 0.95, preparation: 1.1 },
    fair: { coverage: 0.85, preparation: 1.3 },
    poor: { coverage: 0.75, preparation: 1.6 }
  }

  private readonly materialSpecs = {
    'SealMaster PMM': {
      unitCost: 3.79,
      unit: 'gallon',
      category: 'primary' as const,
      baseCoverage: 80,
      minTemp: 50,
      maxTemp: 95
    },
    'Silica Sand 50lb': {
      unitCost: 10.00,
      unit: 'bag',
      category: 'additive' as const,
      ratio: 6, // gallons per bag
      minTemp: 32,
      maxTemp: 120
    },
    'CrackMaster Filler': {
      unitCost: 44.95,
      unit: 'gallon',
      category: 'primary' as const,
      coverage: 'variable',
      minTemp: 50,
      maxTemp: 90
    },
    'Oil Spot Primer': {
      unitCost: 89.95,
      unit: 'gallon',
      category: 'primary' as const,
      coverage: 300,
      minTemp: 55,
      maxTemp: 85
    },
    'Fast Dry Additive': {
      unitCost: 125.00,
      unit: 'gallon',
      category: 'additive' as const,
      ratio: 20, // gallons sealer per gallon additive
      benefit: 'Reduces cure time by 50%'
    }
  }

  public optimizeMaterials(factors: OptimizationFactors): OptimizationResult {
    const materials: MaterialRequirement[] = []
    const recommendations: string[] = []
    const complianceIssues: string[] = []

    // Calculate base sealer requirements
    const qualityAdj = this.qualityAdjustments[factors.qualityLevel]
    const conditionAdj = this.conditionAdjustments[factors.surfaceCondition]
    const baseCoverage = this.baseCoverageRates[factors.applicationMethod]
    
    const adjustedCoverage = baseCoverage * qualityAdj.coverage * conditionAdj.coverage
    const sealerGallons = Math.ceil(factors.projectArea / adjustedCoverage)
    
    // Add waste factor (5-15% based on conditions)
    const wasteFactor = this.calculateWasteFactor(factors)
    const totalSealerGallons = Math.ceil(sealerGallons * (1 + wasteFactor))

    // Primary sealer
    materials.push({
      material: 'SealMaster PMM',
      quantity: totalSealerGallons,
      unit: 'gallon',
      cost: totalSealerGallons * this.materialSpecs['SealMaster PMM'].unitCost,
      category: 'primary'
    })

    // Sand additive (standard practice)
    const sandBags = Math.ceil(totalSealerGallons / 6) // 1 bag per 6 gallons
    materials.push({
      material: 'Silica Sand 50lb',
      quantity: sandBags,
      unit: 'bag',
      cost: sandBags * this.materialSpecs['Silica Sand 50lb'].unitCost,
      category: 'additive'
    })

    // Weather-based additives
    if (factors.weatherConditions.humidity > 75) {
      const fastDryGallons = Math.ceil(totalSealerGallons / 20)
      materials.push({
        material: 'Fast Dry Additive',
        quantity: fastDryGallons,
        unit: 'gallon',
        cost: fastDryGallons * this.materialSpecs['Fast Dry Additive'].unitCost,
        category: 'additive'
      })
      recommendations.push('High humidity detected - Fast Dry additive recommended')
    }

    // Surface condition adjustments
    if (factors.surfaceCondition === 'poor') {
      const primerGallons = Math.ceil(factors.projectArea / 300) // Spot treatment
      materials.push({
        material: 'Oil Spot Primer',
        quantity: primerGallons,
        unit: 'gallon',
        cost: primerGallons * this.materialSpecs['Oil Spot Primer'].unitCost,
        category: 'primary'
      })
      recommendations.push('Poor surface condition - Oil spot primer required for contaminated areas')
    }

    // Safety equipment requirements
    const safetyEquipment = this.calculateSafetyRequirements(factors.projectArea)
    materials.push(...safetyEquipment)

    // Compliance checks
    const compliance = this.checkCompliance(factors, materials)
    
    // Quality score calculation
    const qualityScore = this.calculateQualityScore(factors, materials)

    // Efficiency calculations
    const efficiency = this.calculateEfficiency(factors, materials)

    // Add best practice recommendations
    recommendations.push(...this.getBestPracticeRecommendations(factors))

    return {
      materials,
      totalCost: materials.reduce((sum, m) => sum + m.cost, 0),
      estimatedWaste: wasteFactor,
      recommendations,
      compliance: {
        osha: compliance.osha,
        epa: compliance.epa,
        local: compliance.local,
        issues: complianceIssues
      },
      qualityScore,
      efficiency
    }
  }

  private calculateWasteFactor(factors: OptimizationFactors): number {
    let baseFactor = 0.05 // 5% base waste

    // Adjust for application method
    switch (factors.applicationMethod) {
      case 'spray':
        baseFactor += 0.03 // Higher overspray
        break
      case 'brush':
        baseFactor += 0.02 // Some spillage
        break
      case 'squeegee':
        // Most efficient method
        break
    }

    // Adjust for surface condition
    switch (factors.surfaceCondition) {
      case 'poor':
        baseFactor += 0.05 // More material absorption
        break
      case 'fair':
        baseFactor += 0.02
        break
    }

    // Weather adjustments
    if (factors.weatherConditions.windSpeed > 10) {
      baseFactor += 0.03 // Wind drift for spray applications
    }

    if (factors.weatherConditions.temperature > 85) {
      baseFactor += 0.02 // Faster evaporation
    }

    return Math.min(baseFactor, 0.15) // Cap at 15%
  }

  private calculateSafetyRequirements(projectArea: number): MaterialRequirement[] {
    const safetyItems: MaterialRequirement[] = []
    const crew = Math.max(2, Math.ceil(projectArea / 2000)) // 2000 sq ft per person

    // PPE requirements per OSHA standards
    safetyItems.push({
      material: 'Safety Glasses (ANSI Z87.1)',
      quantity: crew,
      unit: 'each',
      cost: crew * 15.00,
      category: 'safety'
    })

    safetyItems.push({
      material: 'Chemical Resistant Gloves',
      quantity: crew * 2, // 2 pairs per person
      unit: 'pair',
      cost: crew * 2 * 8.00,
      category: 'safety'
    })

    safetyItems.push({
      material: 'N95 Respirators',
      quantity: crew * 3, // 3 per person for shift
      unit: 'each',
      cost: crew * 3 * 2.50,
      category: 'safety'
    })

    safetyItems.push({
      material: 'Non-slip Work Boots',
      quantity: crew,
      unit: 'pair',
      cost: crew * 85.00,
      category: 'safety'
    })

    // Spill control materials
    if (projectArea > 5000) {
      safetyItems.push({
        material: 'Spill Kit (30-gallon)',
        quantity: 1,
        unit: 'kit',
        cost: 125.00,
        category: 'safety'
      })
    }

    return safetyItems
  }

  private checkCompliance(factors: OptimizationFactors, materials: MaterialRequirement[]): {
    osha: boolean
    epa: boolean
    local: boolean
  } {
    // OSHA compliance check
    const hasRequiredPPE = materials.some(m => 
      m.material.includes('Safety Glasses') && 
      materials.some(m2 => m2.material.includes('Respirator'))
    )

    // EPA compliance (chemical handling)
    const hasSpillControl = factors.projectArea <= 5000 || 
      materials.some(m => m.material.includes('Spill Kit'))

    // Local compliance (Virginia/Patrick County)
    const localCompliant = true // Assume compliant unless specific issues

    return {
      osha: hasRequiredPPE,
      epa: hasSpillControl,
      local: localCompliant
    }
  }

  private calculateQualityScore(factors: OptimizationFactors, materials: MaterialRequirement[]): number {
    let score = this.qualityAdjustments[factors.qualityLevel].quality

    // Bonus for proper additives
    if (materials.some(m => m.material.includes('Sand'))) {
      score += 5 // Texture additive
    }

    if (materials.some(m => m.material.includes('Primer'))) {
      score += 5 // Surface preparation
    }

    // Weather appropriateness
    if (factors.weatherConditions.temperature >= 55 && factors.weatherConditions.temperature <= 85) {
      score += 5 // Optimal temperature
    }

    if (factors.weatherConditions.humidity < 70) {
      score += 3 // Good humidity
    }

    return Math.min(score, 100)
  }

  private calculateEfficiency(factors: OptimizationFactors, materials: MaterialRequirement[]): {
    coverage: number
    laborHours: number
    equipmentNeeded: string[]
  } {
    const sealerGallons = materials.find(m => m.material.includes('PMM'))?.quantity || 0
    const actualCoverage = sealerGallons * this.baseCoverageRates[factors.applicationMethod]

    // Labor estimation
    const baseRate = 800 // sq ft per hour
    const conditionMultiplier = this.conditionAdjustments[factors.surfaceCondition].preparation
    const adjustedRate = baseRate / conditionMultiplier

    const laborHours = Math.ceil(factors.projectArea / adjustedRate)

    // Equipment requirements
    const equipmentNeeded = ['Mixing tank', 'Agitator']
    
    switch (factors.applicationMethod) {
      case 'spray':
        equipmentNeeded.push('Spray system', 'Air compressor', 'Spray tips')
        break
      case 'squeegee':
        equipmentNeeded.push('Squeegees', 'Application brushes')
        break
      case 'brush':
        equipmentNeeded.push('Application brushes', 'Rollers')
        break
    }

    if (factors.projectArea > 10000) {
      equipmentNeeded.push('Material pump', 'Distribution system')
    }

    return {
      coverage: actualCoverage,
      laborHours,
      equipmentNeeded
    }
  }

  private getBestPracticeRecommendations(factors: OptimizationFactors): string[] {
    const recommendations: string[] = []

    // Temperature recommendations
    if (factors.weatherConditions.temperature < 55) {
      recommendations.push('Consider delaying application - temperature below recommended minimum (55°F)')
    } else if (factors.weatherConditions.temperature > 90) {
      recommendations.push('Apply early morning or late afternoon to avoid peak heat')
    }

    // Humidity recommendations
    if (factors.weatherConditions.humidity > 80) {
      recommendations.push('High humidity - expect longer cure times, consider fast-dry additive')
    }

    // Wind recommendations
    if (factors.weatherConditions.windSpeed > 15) {
      recommendations.push('Wind speed too high for spray application - use squeegee method')
    }

    // Application method recommendations
    if (factors.applicationMethod === 'spray' && factors.projectArea < 1000) {
      recommendations.push('Consider squeegee application for small areas - more cost effective')
    }

    // Surface condition recommendations
    if (factors.surfaceCondition === 'poor') {
      recommendations.push('Clean surface thoroughly and repair major cracks before sealing')
      recommendations.push('Consider crack filling 24 hours before sealcoat application')
    }

    // Quality level recommendations
    if (factors.qualityLevel === 'basic' && factors.projectArea > 5000) {
      recommendations.push('Consider premium quality for large commercial projects')
    }

    // General best practices
    recommendations.push('Allow 4-6 hours cure time before vehicle traffic')
    recommendations.push('Inspect weather forecast for 8-hour window without rain')
    recommendations.push('Ensure all personnel have completed OSHA safety training')

    return recommendations
  }

  public getComplianceChecklist(): { category: string; items: string[] }[] {
    return [
      {
        category: 'OSHA Safety Requirements',
        items: [
          'Safety glasses (ANSI Z87.1 compliant) for all personnel',
          'Chemical-resistant gloves for material handling',
          'Respiratory protection (N95 minimum) for dust/vapor exposure',
          'Non-slip footwear for wet surface conditions',
          'High-visibility safety vests for traffic areas',
          'First aid kit readily accessible on site',
          'Safety Data Sheets (SDS) available for all chemicals',
          'Emergency contact information posted',
          'Spill response materials and procedures',
          'Employee safety training documentation'
        ]
      },
      {
        category: 'EPA Environmental Compliance',
        items: [
          'Prevent discharge to storm drains or waterways',
          'Contain all spills immediately',
          'Proper disposal of waste materials',
          'Use VOC-compliant materials where required',
          'Implement erosion and sediment controls',
          'Maintain spill prevention plan',
          'Report any environmental incidents',
          'Store materials according to manufacturer guidelines',
          'Use proper loading/unloading procedures',
          'Train employees on environmental protection'
        ]
      },
      {
        category: 'Virginia State Requirements',
        items: [
          'Valid contractor license for commercial work',
          'Workers compensation insurance current',
          'General liability insurance adequate for project',
          'Vehicle registration and commercial plates',
          'DOT compliance for material transport',
          'Environmental permits as required',
          'Local building permits obtained',
          'Traffic control plan approved if needed',
          'Noise ordinance compliance',
          'Waste disposal permits current'
        ]
      },
      {
        category: 'Patrick County Local Requirements',
        items: [
          'Business license current for county operations',
          'Right-of-way permits for road work',
          'Setback requirements compliance',
          'Drainage protection measures',
          'Traffic control coordination with sheriff',
          'Community notification for large projects',
          'Parking and staging area approval',
          'Hours of operation compliance',
          'Equipment inspection current',
          'Emergency contact registration with county'
        ]
      },
      {
        category: 'Industry Best Practices (NAPA)',
        items: [
          'Surface preparation per manufacturer specs',
          'Material application rate verification',
          'Quality control testing procedures',
          'Equipment calibration and maintenance',
          'Weather monitoring throughout application',
          'Customer communication and documentation',
          'Warranty terms clearly communicated',
          'Post-application inspection checklist',
          'Customer satisfaction follow-up',
          'Continuous improvement documentation'
        ]
      }
    ]
  }

  public calculateROI(optimization: OptimizationResult, laborCost: number, equipmentCost: number): {
    totalInvestment: number
    projectedSavings: number
    paybackPeriod: number
    qualityImprovement: number
  } {
    const totalInvestment = optimization.totalCost + laborCost + equipmentCost
    
    // Calculate savings from reduced waste, callbacks, and efficiency
    const wasteSavings = optimization.totalCost * optimization.estimatedWaste * 0.5 // 50% waste reduction
    const qualitySavings = totalInvestment * (optimization.qualityScore / 100 - 0.75) * 0.1 // Quality premium
    const efficiencySavings = laborCost * 0.15 // 15% efficiency gain
    
    const projectedSavings = wasteSavings + qualitySavings + efficiencySavings
    const paybackPeriod = projectedSavings > 0 ? totalInvestment / projectedSavings : 999
    
    return {
      totalInvestment,
      projectedSavings,
      paybackPeriod,
      qualityImprovement: optimization.qualityScore - 75 // Baseline of 75%
    }
  }
}