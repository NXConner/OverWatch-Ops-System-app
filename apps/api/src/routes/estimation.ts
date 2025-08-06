import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { EstimationEngine, ProjectDetails, BUSINESS_CONFIG, MATERIAL_COSTS, APPLICATION_RATES } from '../services/estimation-engine';
import { PDFExportService, PDFExportOptions } from '../services/pdf-export';
import { logger } from '../utils/logger';

const router = Router();
const estimationEngine = EstimationEngine.getInstance();
const pdfExportService = PDFExportService.getInstance();

// Validation middleware for project estimation
const validateEstimationRequest = [
  body('projectType').isIn(['sealcoating', 'crackfilling', 'patching', 'linestriping', 'combination']),
  body('location.address').isString().notEmpty(),
  body('timeline.startDate').isISO8601(),
  body('timeline.estimatedDays').isInt({ min: 1, max: 30 }),
  body('weatherConsiderations').isBoolean(),
  
  // Conditional validations based on project type
  body('sealcoating.squareFootage').optional().isFloat({ min: 100 }),
  body('sealcoating.condition').optional().isIn(['good', 'fair', 'poor', 'heavily_oxidized']),
  body('sealcoating.oilSpots').optional().isBoolean(),
  body('sealcoating.oilSpotArea').optional().isFloat({ min: 0 }),
  
  body('crackFilling.linearFootage').optional().isFloat({ min: 1 }),
  body('crackFilling.crackSeverity').optional().isIn(['light', 'moderate', 'severe']),
  body('crackFilling.requiresSandFill').optional().isBoolean(),
  
  body('patching.squareFootage').optional().isFloat({ min: 1 }),
  body('patching.patchType').optional().isIn(['hot_mix', 'cold_patch']),
  body('patching.thickness').optional().isFloat({ min: 1, max: 6 }),
  
  body('lineStriping.standardStalls').optional().isInt({ min: 0 }),
  body('lineStriping.doubleStalls').optional().isInt({ min: 0 }),
  body('lineStriping.handicapStalls').optional().isInt({ min: 0 }),
  body('lineStriping.customStencils').optional().isInt({ min: 0 }),
  body('lineStriping.crosswalks').optional().isInt({ min: 0 }),
  body('lineStriping.restripe').optional().isBoolean(),
];

/**
 * POST /api/estimation/generate
 * Generate a comprehensive project estimate
 */
router.post('/generate', validateEstimationRequest, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const projectDetails: ProjectDetails = req.body;
    
    // Validate that at least one service type is specified
    const hasService = projectDetails.sealcoating || 
                      projectDetails.crackFilling || 
                      projectDetails.patching || 
                      projectDetails.lineStriping;
    
    if (!hasService) {
      return res.status(400).json({
        error: 'At least one service type must be specified'
      });
    }

    logger.info('Generating estimation', {
      projectType: projectDetails.projectType,
      location: projectDetails.location.address,
      userId: req.user?.id
    });

    const estimate = await estimationEngine.generateEstimate(projectDetails);

    res.json({
      success: true,
      data: estimate
    });

  } catch (error) {
    logger.error('Error in estimation generation:', error);
    res.status(500).json({
      error: 'Failed to generate estimate',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/estimation/business-config
 * Get current business configuration and pricing
 */
router.get('/business-config', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        businessConfig: BUSINESS_CONFIG,
        materialCosts: MATERIAL_COSTS,
        applicationRates: APPLICATION_RATES,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching business config:', error);
    res.status(500).json({
      error: 'Failed to fetch business configuration'
    });
  }
});

/**
 * POST /api/estimation/quick-calculate
 * Quick calculation for specific material needs
 */
router.post('/quick-calculate', [
  body('calculationType').isIn(['sealcoat_materials', 'crack_filler', 'paint_quantity', 'weight_analysis']),
  body('parameters').isObject()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { calculationType, parameters } = req.body;
    let result: any = {};

    switch (calculationType) {
      case 'sealcoat_materials':
        result = calculateSealcoatMaterials(parameters.squareFootage, parameters.condition);
        break;
      
      case 'crack_filler':
        result = calculateCrackFillerNeeds(parameters.linearFootage, parameters.severity);
        break;
      
      case 'paint_quantity':
        result = calculatePaintQuantity(parameters.standardStalls, parameters.doubleStalls, parameters.crosswalks);
        break;
      
      case 'weight_analysis':
        result = calculateQuickWeightAnalysis(parameters.sealerGallons, parameters.sandBags);
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid calculation type' });
    }

    res.json({
      success: true,
      calculationType,
      data: result
    });

  } catch (error) {
    logger.error('Error in quick calculation:', error);
    res.status(500).json({
      error: 'Calculation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/estimation/material-cost-update
 * Update material costs (admin only)
 */
router.post('/material-cost-update', [
  body('material').isString().notEmpty(),
  body('newPrice').isFloat({ min: 0 }),
  body('effectiveDate').isISO8601()
], async (req: Request, res: Response) => {
  try {
    // Check if user has admin role
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Insufficient permissions. Admin access required.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { material, newPrice, effectiveDate } = req.body;

    logger.info('Material cost update requested', {
      material,
      newPrice,
      effectiveDate,
      userId: req.user.id
    });

    // In a production system, this would update the database
    // For now, we'll log the change and return success
    res.json({
      success: true,
      message: `Material cost updated: ${material} = $${newPrice}`,
      effectiveDate,
      updatedBy: req.user.email
    });

  } catch (error) {
    logger.error('Error updating material cost:', error);
    res.status(500).json({
      error: 'Failed to update material cost'
    });
  }
});

/**
 * GET /api/estimation/distance/:from/:to
 * Calculate distance between two addresses
 */
router.get('/distance/:from/:to', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.params;
    
    // Decode URL parameters
    const fromAddress = decodeURIComponent(from);
    const toAddress = decodeURIComponent(to);

    // In production, integrate with Google Maps Distance Matrix API
    // For now, simulate calculation
    const estimatedDistance = Math.floor(Math.random() * 50) + 10;
    const estimatedDriveTime = Math.ceil(estimatedDistance / 35 * 60); // Assuming 35 mph average

    res.json({
      success: true,
      data: {
        from: fromAddress,
        to: toAddress,
        distanceMiles: estimatedDistance,
        estimatedDriveTimeMinutes: estimatedDriveTime,
        fuelCost: (estimatedDistance * 2 / BUSINESS_CONFIG.equipment.c30.mpg) * MATERIAL_COSTS.fuel.diesel
      }
    });

  } catch (error) {
    logger.error('Error calculating distance:', error);
    res.status(500).json({
      error: 'Failed to calculate distance'
    });
  }
});

/**
 * POST /api/estimation/export-pdf
 * Export estimate as PDF
 */
router.post('/export-pdf', [
  body('estimate').isObject(),
  body('format').optional().isIn(['standard', 'detailed', 'comparison']),
  body('options').optional().isObject()
], async (req: Request, res: Response) => {
  try {
    const { estimate, format = 'standard', options = {} } = req.body;

    logger.info('PDF export requested', {
      format,
      estimateTotal: estimate.breakdown?.total,
      userId: req.user?.id
    });

    const pdfOptions: PDFExportOptions = {
      format: format as any,
      includeImages: options.includeImages || false,
      includeTerms: options.includeTerms !== false, // Default to true
      customNotes: options.customNotes
    };

    const pdfContent = await pdfExportService.generateEstimatePDF(estimate, pdfOptions);

    res.json({
      success: true,
      data: {
        format,
        pdfContent,
        generatedAt: new Date().toISOString(),
        fileName: `estimate_${Date.now()}.pdf`,
        contentType: 'text/html' // In production, would be 'application/pdf'
      }
    });

  } catch (error) {
    logger.error('Error exporting PDF:', error);
    res.status(500).json({
      error: 'Failed to export PDF',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions for quick calculations

function calculateSealcoatMaterials(squareFootage: number, condition: string = 'good') {
  const gallonsNeeded = Math.ceil(squareFootage / APPLICATION_RATES.sealcoating.coveragePerGallon);
  const concentrateGallons = Math.ceil(gallonsNeeded / 1.2);
  const sandBags = Math.ceil((concentrateGallons / 100) * APPLICATION_RATES.sealcoating.sandRatio / 50);
  const waterGallons = Math.ceil(concentrateGallons * 0.2);
  const fastDryBuckets = Math.ceil((concentrateGallons / 125) * APPLICATION_RATES.sealcoating.fastDryRatio / 5);

  const materialCost = (concentrateGallons * MATERIAL_COSTS.sealcoat.pmmConcentrate) +
                      (sandBags * MATERIAL_COSTS.sealcoat.sand50lb) +
                      (fastDryBuckets * MATERIAL_COSTS.sealcoat.fastDry5gal) +
                      (waterGallons * MATERIAL_COSTS.sealcoat.water);

  return {
    coverage: {
      squareFootage,
      totalGallonsNeeded: gallonsNeeded,
      condition
    },
    materials: {
      pmmConcentrate: { quantity: concentrateGallons, cost: concentrateGallons * MATERIAL_COSTS.sealcoat.pmmConcentrate },
      sand: { quantity: sandBags, cost: sandBags * MATERIAL_COSTS.sealcoat.sand50lb },
      water: { quantity: waterGallons, cost: waterGallons * MATERIAL_COSTS.sealcoat.water },
      fastDry: { quantity: fastDryBuckets, cost: fastDryBuckets * MATERIAL_COSTS.sealcoat.fastDry5gal }
    },
    totalCost: materialCost
  };
}

function calculateCrackFillerNeeds(linearFootage: number, severity: string = 'moderate') {
  const baseLinearFeet = APPLICATION_RATES.crackFilling.materialCoverageLinearFeet;
  let adjustedCoverage = baseLinearFeet;
  
  if (severity === 'severe') {
    adjustedCoverage *= 0.75; // 25% more material needed for severe cracks
  } else if (severity === 'light') {
    adjustedCoverage *= 1.25; // 25% less material needed for light cracks
  }

  const crackMasterBoxes = Math.ceil(linearFootage / adjustedCoverage);
  const propaneTanks = Math.max(1, Math.ceil(linearFootage / 1000));

  return {
    linearFootage,
    severity,
    materials: {
      crackMaster: { quantity: crackMasterBoxes, cost: crackMasterBoxes * MATERIAL_COSTS.crackFilling.crackMaster30lb },
      propane: { quantity: propaneTanks, cost: propaneTanks * MATERIAL_COSTS.crackFilling.propaneTank }
    },
    totalCost: (crackMasterBoxes * MATERIAL_COSTS.crackFilling.crackMaster30lb) + 
               (propaneTanks * MATERIAL_COSTS.crackFilling.propaneTank)
  };
}

function calculatePaintQuantity(standardStalls: number, doubleStalls: number, crosswalks: number) {
  const totalLinearFeet = (standardStalls * APPLICATION_RATES.lineStriping.standardStall) +
                         (doubleStalls * APPLICATION_RATES.lineStriping.doubleStall) +
                         (crosswalks * 50);

  const paintCost = totalLinearFeet * MATERIAL_COSTS.lineStriping.paint;

  return {
    stalls: { standard: standardStalls, double: doubleStalls },
    crosswalks,
    totalLinearFeet,
    paintCost,
    estimatedGallons: Math.ceil(totalLinearFeet / 1600) // Approximate 1600 linear feet per gallon
  };
}

function calculateQuickWeightAnalysis(sealerGallons: number, sandBags: number) {
  const vehicleWeight = BUSINESS_CONFIG.equipment.c30.curbWeight;
  const sk550EmptyWeight = BUSINESS_CONFIG.equipment.sk550.emptyWeight;
  const sealerWeight = sealerGallons * 10; // 10 lbs per gallon
  const sandWeight = sandBags * 50; // 50 lbs per bag
  const crewWeight = 3 * 200; // 3 people at 200 lbs each

  const totalWeight = vehicleWeight + sk550EmptyWeight + sealerWeight + sandWeight + crewWeight;
  const gvwr = BUSINESS_CONFIG.equipment.c30.gvwr;
  const withinLimits = totalWeight <= gvwr;
  const safetyMargin = ((gvwr - totalWeight) / gvwr) * 100;

  return {
    breakdown: {
      vehicleWeight,
      equipmentWeight: sk550EmptyWeight,
      sealerWeight,
      sandWeight,
      crewWeight,
      totalWeight
    },
    limits: {
      gvwr,
      withinLimits,
      safetyMargin: Math.round(safetyMargin * 100) / 100,
      overWeight: Math.max(0, totalWeight - gvwr)
    },
    recommendations: getWeightRecommendations(totalWeight, gvwr, safetyMargin)
  };
}

function getWeightRecommendations(totalWeight: number, gvwr: number, safetyMargin: number): string[] {
  const recommendations = [];

  if (totalWeight > gvwr) {
    recommendations.push('OVERWEIGHT: Reduce load or make multiple trips');
  } else if (safetyMargin < 10) {
    recommendations.push('Low safety margin: Consider reducing load');
  } else if (safetyMargin > 25) {
    recommendations.push('Good safety margin: Can add more material if needed');
  }

  if (totalWeight > gvwr * 0.9) {
    recommendations.push('Near weight limit: Check tire pressure and suspension');
  }

  return recommendations;
}

function generateEstimatePDF(estimate: any, format: string): any {
  // This would generate actual PDF content in production
  // For now, return structured data that can be used for PDF generation
  
  const header = {
    companyName: "Blacktop Solutions LLC",
    address: BUSINESS_CONFIG.address,
    phone: "(276) 555-0123",
    email: "info@blacktopsolutions.com",
    estimateDate: new Date().toLocaleDateString(),
    validUntil: estimate.projectSummary.validUntil
  };

  const sections = [];

  // Project Summary
  sections.push({
    title: "Project Summary",
    content: {
      description: estimate.projectSummary.description,
      timeline: estimate.projectSummary.timeline,
      totalCost: estimate.projectSummary.totalCost
    }
  });

  // Detailed Breakdown
  if (format === 'detailed' || format === 'comparison') {
    sections.push({
      title: "Cost Breakdown",
      content: estimate.breakdown
    });

    if (estimate.weightAnalysis) {
      sections.push({
        title: "Weight Analysis",
        content: estimate.weightAnalysis
      });
    }
  }

  // Alternatives
  if (format === 'comparison') {
    sections.push({
      title: "Alternative Pricing",
      content: estimate.alternatives
    });
  }

  // Recommendations and Disclaimers
  sections.push({
    title: "Recommendations",
    content: estimate.recommendations
  });

  sections.push({
    title: "Terms and Conditions",
    content: estimate.disclaimers
  });

  return {
    header,
    sections,
    footer: {
      generatedAt: new Date().toISOString(),
      format,
      version: "1.0"
    }
  };
}

export default router;