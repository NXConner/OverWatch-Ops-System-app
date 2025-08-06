import { logger } from '../utils/logger';

// Business Configuration for Virginia Operations
export const BUSINESS_CONFIG = {
  address: "337 Ayers Orchard Road, Stuart, VA 24171",
  employees: {
    fullTime: 2,
    partTime: 1,
    blendedHourlyRate: 50 // $40-60 range, using $50 including overhead
  },
  supplier: {
    name: "SealMaster",
    address: "703 West Decatur Street, Madison, NC 27025"
  },
  equipment: {
    c30: {
      model: "1978 Chevy C30 Custom Deluxe",
      curbWeight: 4300, // lbs
      gvwr: 12000, // Conservative estimate for 1-ton truck
      mpg: 15,
      fuelCapacity: 40 // gallons
    },
    sk550: {
      model: "SealMaster SK 550 Tank Sealing Machine",
      emptyWeight: 1865, // lbs
      capacity: 550 // gallons
    },
    dakota: {
      model: "1995 Dodge Dakota V6 Magnum",
      mpg: 18,
      trailerCapacity: 3000 // lbs for 8ft utility trailer
    }
  }
};

// Current Material Costs (Virginia 2025)
export const MATERIAL_COSTS = {
  sealcoat: {
    pmmConcentrate: 3.79, // per gallon
    sand50lb: 10.00, // per 50lb bag
    prepSeal5gal: 50.00, // per 5-gallon bucket
    fastDry5gal: 50.00, // per 5-gallon bucket
    water: 0.02 // nominal cost per gallon
  },
  crackFilling: {
    crackMaster30lb: 44.95, // per 30lb box
    propaneTank: 10.00, // refill cost
    sand50lb: 10.00 // for deep crack prep
  },
  lineStriping: {
    paint: 0.85, // per linear foot
    stencils: 15.00, // per handicap symbol
    mobilization: 250.00 // average mobilization fee
  },
  fuel: {
    diesel: 3.45, // per gallon (current estimate)
    gasoline: 3.25 // per gallon
  }
};

// Application Rates and Coverage
export const APPLICATION_RATES = {
  sealcoating: {
    coveragePerGallon: 76, // sq ft per gallon of mixed sealer
    sandRatio: 300, // lbs sand per 100 gallons concentrate
    waterRatio: 20, // percent water by volume
    fastDryRatio: 2 // gallons per 125 gallons concentrate
  },
  crackFilling: {
    costPerLinearFoot: { min: 0.50, max: 3.00, avg: 1.50 },
    laborHoursPerHundredFeet: 1.0,
    materialCoverageLinearFeet: 500 // feet per 30lb box typical
  },
  patching: {
    hotMix: { min: 2.00, max: 5.00, avg: 3.50 }, // per sq ft
    coldPatch: { min: 2.00, max: 4.00, avg: 3.00 } // per sq ft
  },
  lineStriping: {
    standardStall: 20, // linear feet
    doubleStall: 25, // linear feet
    costPerLinearFoot: { min: 0.75, max: 1.00, avg: 0.875 },
    avgCostPerStall: 4.50
  }
};

export interface ProjectDetails {
  projectType: 'sealcoating' | 'crackfilling' | 'patching' | 'linestriping' | 'combination';
  location: {
    address: string;
    distanceFromBase?: number; // miles
  };
  sealcoating?: {
    squareFootage: number;
    condition: 'good' | 'fair' | 'poor' | 'heavily_oxidized';
    oilSpots: boolean;
    oilSpotArea?: number; // sq ft
  };
  crackFilling?: {
    linearFootage: number;
    crackSeverity: 'light' | 'moderate' | 'severe';
    requiresSandFill: boolean;
  };
  patching?: {
    squareFootage: number;
    patchType: 'hot_mix' | 'cold_patch';
    thickness: number; // inches
  };
  lineStriping?: {
    standardStalls: number;
    doubleStalls: number;
    handicapStalls: number;
    customStencils: number;
    crosswalks: number;
    restripe: boolean; // true for re-striping, false for new layout
  };
  timeline: {
    startDate: string;
    estimatedDays: number;
  };
  weatherConsiderations: boolean;
}

export interface EstimationResult {
  projectSummary: {
    description: string;
    totalCost: number;
    timeline: string;
    validUntil: string;
  };
  breakdown: {
    materials: MaterialBreakdown;
    labor: LaborBreakdown;
    equipment: EquipmentBreakdown;
    fuel: FuelBreakdown;
    mobilization: number;
    subtotal: number;
    overhead: number;
    profit: number;
    total: number;
  };
  weightAnalysis?: WeightAnalysis;
  alternatives: {
    withMarkup25: EstimationBreakdown;
    roundedUp: EstimationBreakdown;
  };
  recommendations: string[];
  disclaimers: string[];
}

export interface MaterialBreakdown {
  sealcoating?: {
    pmmConcentrate: { quantity: number; cost: number; };
    sand: { quantity: number; cost: number; };
    water: { quantity: number; cost: number; };
    fastDry: { quantity: number; cost: number; };
    prepSeal?: { quantity: number; cost: number; };
    total: number;
  };
  crackFilling?: {
    crackMaster: { quantity: number; cost: number; };
    propane: { quantity: number; cost: number; };
    sand?: { quantity: number; cost: number; };
    total: number;
  };
  lineStriping?: {
    paint: { quantity: number; cost: number; };
    stencils: { quantity: number; cost: number; };
    total: number;
  };
  patching?: {
    material: { quantity: number; cost: number; };
    total: number;
  };
  grandTotal: number;
}

export interface LaborBreakdown {
  preparation: { hours: number; cost: number; };
  application: { hours: number; cost: number; };
  cleanup: { hours: number; cost: number; };
  total: number;
}

export interface EquipmentBreakdown {
  sealcoatingMachine?: { hours: number; cost: number; };
  crackFillingMachine?: { hours: number; cost: number; };
  lineStripingEquipment?: { hours: number; cost: number; };
  miscEquipment: { cost: number; };
  total: number;
}

export interface FuelBreakdown {
  transportation: { miles: number; cost: number; };
  equipmentOperation: { hours: number; cost: number; };
  total: number;
}

export interface WeightAnalysis {
  vehicleWeight: number;
  equipmentWeight: number;
  materialWeight: number;
  crewWeight: number;
  totalWeight: number;
  gvwr: number;
  withinLimits: boolean;
  safetyMargin: number;
  warnings: string[];
}

export interface EstimationBreakdown {
  subtotal: number;
  markup: number;
  markupPercentage: number;
  total: number;
}

export class EstimationEngine {
  private static instance: EstimationEngine;

  public static getInstance(): EstimationEngine {
    if (!EstimationEngine.instance) {
      EstimationEngine.instance = new EstimationEngine();
    }
    return EstimationEngine.instance;
  }

  async generateEstimate(projectDetails: ProjectDetails): Promise<EstimationResult> {
    logger.info('Generating estimate for project', { projectType: projectDetails.projectType });

    try {
      // Calculate distance if not provided
      if (!projectDetails.location.distanceFromBase) {
        projectDetails.location.distanceFromBase = await this.calculateDistance(
          BUSINESS_CONFIG.address,
          projectDetails.location.address
        );
      }

      // Calculate material costs
      const materials = this.calculateMaterialCosts(projectDetails);
      
      // Calculate labor costs
      const labor = this.calculateLaborCosts(projectDetails);
      
      // Calculate equipment costs
      const equipment = this.calculateEquipmentCosts(projectDetails);
      
      // Calculate fuel costs
      const fuel = this.calculateFuelCosts(projectDetails);
      
      // Calculate mobilization
      const mobilization = this.calculateMobilization(projectDetails);
      
      // Calculate subtotal
      const subtotal = materials.grandTotal + labor.total + equipment.total + fuel.total + mobilization;
      
      // Apply overhead and profit
      const overhead = subtotal * 0.15; // 15% overhead
      const profit = subtotal * 0.20; // 20% profit margin
      const total = subtotal + overhead + profit;

      // Weight analysis for sealcoating projects
      let weightAnalysis: WeightAnalysis | undefined;
      if (projectDetails.sealcoating) {
        weightAnalysis = this.calculateWeightAnalysis(projectDetails, materials);
      }

      // Generate alternatives
      const alternatives = this.generateAlternativePricing(subtotal);

      // Generate recommendations and disclaimers
      const recommendations = this.generateRecommendations(projectDetails);
      const disclaimers = this.generateDisclaimers();

      const result: EstimationResult = {
        projectSummary: {
          description: this.generateProjectDescription(projectDetails),
          totalCost: total,
          timeline: `${projectDetails.timeline.estimatedDays} day(s)`,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        },
        breakdown: {
          materials,
          labor,
          equipment,
          fuel,
          mobilization,
          subtotal,
          overhead,
          profit,
          total
        },
        weightAnalysis,
        alternatives,
        recommendations,
        disclaimers
      };

      logger.info('Estimate generated successfully', { 
        total: result.breakdown.total,
        projectType: projectDetails.projectType 
      });

      return result;

    } catch (error) {
      logger.error('Error generating estimate:', error);
      throw new Error('Failed to generate estimate');
    }
  }

  private calculateMaterialCosts(project: ProjectDetails): MaterialBreakdown {
    const breakdown: MaterialBreakdown = { grandTotal: 0 };

    // Sealcoating materials
    if (project.sealcoating) {
      const sqft = project.sealcoating.squareFootage;
      const gallonsNeeded = Math.ceil(sqft / APPLICATION_RATES.sealcoating.coveragePerGallon);
      
      // PMM Concentrate calculation
      const concentrateGallons = Math.ceil(gallonsNeeded / 1.2); // Account for 20% water
      const pmmCost = concentrateGallons * MATERIAL_COSTS.sealcoat.pmmConcentrate;
      
      // Sand calculation
      const sandLbs = Math.ceil((concentrateGallons / 100) * APPLICATION_RATES.sealcoating.sandRatio);
      const sandBags = Math.ceil(sandLbs / 50);
      const sandCost = sandBags * MATERIAL_COSTS.sealcoat.sand50lb;
      
      // Water calculation
      const waterGallons = Math.ceil(concentrateGallons * 0.2);
      const waterCost = waterGallons * MATERIAL_COSTS.sealcoat.water;
      
      // Fast Dry calculation
      const fastDryGallons = Math.ceil((concentrateGallons / 125) * APPLICATION_RATES.sealcoating.fastDryRatio);
      const fastDryBuckets = Math.ceil(fastDryGallons / 5);
      const fastDryCost = fastDryBuckets * MATERIAL_COSTS.sealcoat.fastDry5gal;

      breakdown.sealcoating = {
        pmmConcentrate: { quantity: concentrateGallons, cost: pmmCost },
        sand: { quantity: sandBags, cost: sandCost },
        water: { quantity: waterGallons, cost: waterCost },
        fastDry: { quantity: fastDryBuckets, cost: fastDryCost },
        total: pmmCost + sandCost + waterCost + fastDryCost
      };

      // Prep Seal for oil spots
      if (project.sealcoating.oilSpots && project.sealcoating.oilSpotArea) {
        const prepSealGallons = Math.ceil(project.sealcoating.oilSpotArea / 175); // 175 sq ft per gallon
        const prepSealBuckets = Math.ceil(prepSealGallons / 5);
        const prepSealCost = prepSealBuckets * MATERIAL_COSTS.sealcoat.prepSeal5gal;
        
        breakdown.sealcoating.prepSeal = { quantity: prepSealBuckets, cost: prepSealCost };
        breakdown.sealcoating.total += prepSealCost;
      }

      breakdown.grandTotal += breakdown.sealcoating.total;
    }

    // Crack filling materials
    if (project.crackFilling) {
      const linearFeet = project.crackFilling.linearFootage;
      const crackMasterBoxes = Math.ceil(linearFeet / APPLICATION_RATES.crackFilling.materialCoverageLinearFeet);
      const crackMasterCost = crackMasterBoxes * MATERIAL_COSTS.crackFilling.crackMaster30lb;
      
      // Propane tanks (estimate 1 tank per 1000 linear feet)
      const propaneTanks = Math.max(1, Math.ceil(linearFeet / 1000));
      const propaneCost = propaneTanks * MATERIAL_COSTS.crackFilling.propaneTank;

      breakdown.crackFilling = {
        crackMaster: { quantity: crackMasterBoxes, cost: crackMasterCost },
        propane: { quantity: propaneTanks, cost: propaneCost },
        total: crackMasterCost + propaneCost
      };

      // Sand for deep crack preparation
      if (project.crackFilling.requiresSandFill) {
        const sandBags = Math.max(1, Math.ceil(linearFeet / 500)); // 1 bag per 500 feet
        const sandCost = sandBags * MATERIAL_COSTS.crackFilling.sand50lb;
        
        breakdown.crackFilling.sand = { quantity: sandBags, cost: sandCost };
        breakdown.crackFilling.total += sandCost;
      }

      breakdown.grandTotal += breakdown.crackFilling.total;
    }

    // Line striping materials
    if (project.lineStriping) {
      const totalLinearFeet = (project.lineStriping.standardStalls * APPLICATION_RATES.lineStriping.standardStall) +
                             (project.lineStriping.doubleStalls * APPLICATION_RATES.lineStriping.doubleStall) +
                             (project.lineStriping.crosswalks * 50); // Estimate 50 ft per crosswalk
      
      const paintCost = totalLinearFeet * MATERIAL_COSTS.lineStriping.paint;
      const stencilsCost = (project.lineStriping.handicapStalls + project.lineStriping.customStencils) * 
                          MATERIAL_COSTS.lineStriping.stencils;

      breakdown.lineStriping = {
        paint: { quantity: totalLinearFeet, cost: paintCost },
        stencils: { quantity: project.lineStriping.handicapStalls + project.lineStriping.customStencils, cost: stencilsCost },
        total: paintCost + stencilsCost
      };

      breakdown.grandTotal += breakdown.lineStriping.total;
    }

    // Patching materials
    if (project.patching) {
      const sqft = project.patching.squareFootage;
      const avgCost = project.patching.patchType === 'hot_mix' ? 
                     APPLICATION_RATES.patching.hotMix.avg : 
                     APPLICATION_RATES.patching.coldPatch.avg;
      
      const materialCost = sqft * avgCost * 0.6; // 60% of total cost is material

      breakdown.patching = {
        material: { quantity: sqft, cost: materialCost },
        total: materialCost
      };

      breakdown.grandTotal += breakdown.patching.total;
    }

    return breakdown;
  }

  private calculateLaborCosts(project: ProjectDetails): LaborBreakdown {
    let totalHours = 0;
    let prepHours = 0;
    let applicationHours = 0;
    let cleanupHours = 1; // Base cleanup time

    // Sealcoating labor
    if (project.sealcoating) {
      const sqft = project.sealcoating.squareFootage;
      prepHours += sqft / 2000; // 2000 sq ft per hour prep
      applicationHours += sqft / 1500; // 1500 sq ft per hour application
      if (project.sealcoating.condition === 'heavily_oxidized') {
        prepHours *= 1.5; // 50% more prep time
      }
    }

    // Crack filling labor
    if (project.crackFilling) {
      const linearFeet = project.crackFilling.linearFootage;
      applicationHours += linearFeet / 100; // 100 feet per hour
      if (project.crackFilling.crackSeverity === 'severe') {
        applicationHours *= 1.5;
      }
    }

    // Line striping labor
    if (project.lineStriping) {
      const totalStalls = project.lineStriping.standardStalls + project.lineStriping.doubleStalls;
      prepHours += totalStalls / 20; // 20 stalls prep per hour
      applicationHours += totalStalls / 15; // 15 stalls striping per hour
    }

    // Patching labor
    if (project.patching) {
      const sqft = project.patching.squareFootage;
      prepHours += sqft / 200; // 200 sq ft prep per hour
      applicationHours += sqft / 150; // 150 sq ft patching per hour
    }

    totalHours = prepHours + applicationHours + cleanupHours;

    const hourlyRate = BUSINESS_CONFIG.employees.blendedHourlyRate;

    return {
      preparation: { hours: Math.ceil(prepHours), cost: Math.ceil(prepHours) * hourlyRate },
      application: { hours: Math.ceil(applicationHours), cost: Math.ceil(applicationHours) * hourlyRate },
      cleanup: { hours: cleanupHours, cost: cleanupHours * hourlyRate },
      total: Math.ceil(totalHours) * hourlyRate
    };
  }

  private calculateEquipmentCosts(project: ProjectDetails): EquipmentBreakdown {
    const breakdown: EquipmentBreakdown = { total: 0, miscEquipment: { cost: 50 } };

    // Calculate total project hours for equipment usage
    const totalProjectHours = this.estimateProjectHours(project);

    if (project.sealcoating) {
      const equipmentCost = totalProjectHours * 50; // $50/hour for SK 550 machine
      breakdown.sealcoatingMachine = { hours: totalProjectHours, cost: equipmentCost };
      breakdown.total += equipmentCost;
    }

    if (project.crackFilling) {
      const equipmentCost = totalProjectHours * 30; // $30/hour for crack filling machine
      breakdown.crackFillingMachine = { hours: totalProjectHours, cost: equipmentCost };
      breakdown.total += equipmentCost;
    }

    if (project.lineStriping) {
      const equipmentCost = totalProjectHours * 25; // $25/hour for line striping equipment
      breakdown.lineStripingEquipment = { hours: totalProjectHours, cost: equipmentCost };
      breakdown.total += equipmentCost;
    }

    breakdown.total += breakdown.miscEquipment.cost;
    return breakdown;
  }

  private calculateFuelCosts(project: ProjectDetails): FuelBreakdown {
    const distance = project.location.distanceFromBase || 50; // Default 50 miles if not calculated
    const roundTripMiles = distance * 2;
    
    // Transportation fuel (truck to site and back)
    const transportationCost = (roundTripMiles / BUSINESS_CONFIG.equipment.c30.mpg) * MATERIAL_COSTS.fuel.diesel;

    // Equipment operation fuel
    const projectHours = this.estimateProjectHours(project);
    const equipmentFuelCost = projectHours * 2 * MATERIAL_COSTS.fuel.diesel; // 2 gallons per hour

    return {
      transportation: { miles: roundTripMiles, cost: transportationCost },
      equipmentOperation: { hours: projectHours, cost: equipmentFuelCost },
      total: transportationCost + equipmentFuelCost
    };
  }

  private calculateMobilization(project: ProjectDetails): number {
    const distance = project.location.distanceFromBase || 50;
    
    // Base mobilization fee plus distance factor
    let mobilization = MATERIAL_COSTS.lineStriping.mobilization;
    
    if (distance > 30) {
      mobilization += (distance - 30) * 5; // $5 per mile over 30 miles
    }

    return mobilization;
  }

  private calculateWeightAnalysis(project: ProjectDetails, materials: MaterialBreakdown): WeightAnalysis {
    const vehicleWeight = BUSINESS_CONFIG.equipment.c30.curbWeight;
    const sk550EmptyWeight = BUSINESS_CONFIG.equipment.sk550.emptyWeight;
    
    // Calculate sealer weight
    let sealerWeight = 0;
    if (materials.sealcoating) {
      const totalGallons = materials.sealcoating.pmmConcentrate.quantity + 
                          (materials.sealcoating.water?.quantity || 0);
      sealerWeight = totalGallons * 10; // 10 lbs per gallon
    }

    const equipmentWeight = sk550EmptyWeight + sealerWeight;
    const materialWeight = (materials.sealcoating?.sand?.quantity || 0) * 50; // 50 lbs per bag
    const crewWeight = 3 * 200; // 3 people at 200 lbs each (conservative)

    const totalWeight = vehicleWeight + equipmentWeight + materialWeight + crewWeight;
    const gvwr = BUSINESS_CONFIG.equipment.c30.gvwr;
    const withinLimits = totalWeight <= gvwr;
    const safetyMargin = ((gvwr - totalWeight) / gvwr) * 100;

    const warnings: string[] = [];
    if (!withinLimits) {
      warnings.push(`Total weight (${totalWeight} lbs) exceeds GVWR (${gvwr} lbs)`);
    }
    if (safetyMargin < 10) {
      warnings.push(`Low safety margin (${safetyMargin.toFixed(1)}%). Consider multiple trips.`);
    }

    return {
      vehicleWeight,
      equipmentWeight,
      materialWeight,
      crewWeight,
      totalWeight,
      gvwr,
      withinLimits,
      safetyMargin,
      warnings
    };
  }

  private generateAlternativePricing(subtotal: number): {
    withMarkup25: EstimationBreakdown;
    roundedUp: EstimationBreakdown;
  } {
    // 25% markup version
    const markup25 = subtotal * 0.25;
    const total25 = subtotal + markup25;

    // Rounded up version
    const roundedSubtotal = Math.ceil(subtotal / 10) * 10;
    const roundedMarkup = roundedSubtotal - subtotal;
    const roundedMarkupPercent = (roundedMarkup / subtotal) * 100;
    const finalRoundedTotal = roundedSubtotal + (roundedSubtotal * 0.25);

    return {
      withMarkup25: {
        subtotal,
        markup: markup25,
        markupPercentage: 25,
        total: total25
      },
      roundedUp: {
        subtotal: roundedSubtotal,
        markup: finalRoundedTotal - roundedSubtotal,
        markupPercentage: roundedMarkupPercent + 25,
        total: finalRoundedTotal
      }
    };
  }

  private estimateProjectHours(project: ProjectDetails): number {
    let hours = 0;

    if (project.sealcoating) {
      hours += project.sealcoating.squareFootage / 1000; // 1000 sq ft per hour including prep
    }
    if (project.crackFilling) {
      hours += project.crackFilling.linearFootage / 100; // 100 feet per hour
    }
    if (project.lineStriping) {
      const totalStalls = project.lineStriping.standardStalls + project.lineStriping.doubleStalls;
      hours += totalStalls / 10; // 10 stalls per hour including prep
    }
    if (project.patching) {
      hours += project.patching.squareFootage / 100; // 100 sq ft per hour
    }

    return Math.max(2, Math.ceil(hours)); // Minimum 2 hours
  }

  private generateProjectDescription(project: ProjectDetails): string {
    const services = [];
    
    if (project.sealcoating) {
      services.push(`Sealcoating ${project.sealcoating.squareFootage.toLocaleString()} sq ft`);
    }
    if (project.crackFilling) {
      services.push(`Crack filling ${project.crackFilling.linearFootage.toLocaleString()} linear ft`);
    }
    if (project.patching) {
      services.push(`Asphalt patching ${project.patching.squareFootage.toLocaleString()} sq ft`);
    }
    if (project.lineStriping) {
      const totalStalls = project.lineStriping.standardStalls + project.lineStriping.doubleStalls;
      services.push(`Line striping ${totalStalls} parking stalls`);
    }

    return services.join(', ') + ` at ${project.location.address}`;
  }

  private generateRecommendations(project: ProjectDetails): string[] {
    const recommendations = [];

    if (project.sealcoating?.condition === 'heavily_oxidized') {
      recommendations.push('Consider applying prep seal to heavily oxidized areas for better adhesion');
    }

    if (project.crackFilling?.crackSeverity === 'severe') {
      recommendations.push('Deep cracks may require sand filling before crack filler application');
    }

    if (project.timeline.estimatedDays > 1) {
      recommendations.push('Multi-day project - weather monitoring recommended');
    }

    const distance = project.location.distanceFromBase || 0;
    if (distance > 50) {
      recommendations.push('Consider overnight accommodation for distant projects to reduce travel costs');
    }

    recommendations.push('Optimal conditions: Temperature 50°F+, low humidity, no precipitation forecast for 24 hours');

    return recommendations;
  }

  private generateDisclaimers(): string[] {
    return [
      'Estimate valid for 30 days from date of issue',
      'Final pricing subject to site inspection and conditions',
      'Weather delays may affect timeline and costs',
      'Material costs subject to supplier pricing changes',
      'Additional charges may apply for unforeseen site conditions',
      'Load calculations based on equipment specifications - verify with DOT if required'
    ];
  }

  private async calculateDistance(from: string, to: string): Promise<number> {
    // This would integrate with a mapping service like Google Maps
    // For now, return a reasonable estimate based on Virginia geography
    logger.info('Calculating distance', { from, to });
    
    // Placeholder implementation - in production, integrate with Google Maps API
    // For Stuart, VA area, most jobs likely within 50 mile radius
    return Math.floor(Math.random() * 50) + 10; // Random 10-60 miles for demo
  }
}