import { logger } from '../utils/logger';
import { BUSINESS_CONFIG } from './estimation-engine';

export interface PDFExportOptions {
  format: 'standard' | 'detailed' | 'comparison';
  includeImages: boolean;
  includeTerms: boolean;
  companyLogo?: string;
  customNotes?: string;
}

export interface EstimateData {
  projectSummary: {
    description: string;
    totalCost: number;
    timeline: string;
    validUntil: string;
  };
  breakdown: {
    materials: any;
    labor: any;
    equipment: any;
    fuel: any;
    mobilization: number;
    subtotal: number;
    overhead: number;
    profit: number;
    total: number;
  };
  weightAnalysis?: any;
  alternatives: {
    withMarkup25: any;
    roundedUp: any;
  };
  recommendations: string[];
  disclaimers: string[];
  customerInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  projectDetails?: any;
}

export class PDFExportService {
  private static instance: PDFExportService;

  public static getInstance(): PDFExportService {
    if (!PDFExportService.instance) {
      PDFExportService.instance = new PDFExportService();
    }
    return PDFExportService.instance;
  }

  async generateEstimatePDF(
    estimate: EstimateData, 
    options: PDFExportOptions = { format: 'standard', includeImages: false, includeTerms: true }
  ): Promise<string> {
    logger.info('Generating PDF estimate', { 
      format: options.format, 
      totalCost: estimate.projectSummary.totalCost 
    });

    try {
      const htmlContent = this.generateHTMLEstimate(estimate, options);
      
      // In production, use puppeteer or similar for actual PDF generation
      // For now, return the HTML content that would be converted to PDF
      return htmlContent;

    } catch (error) {
      logger.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF estimate');
    }
  }

  private generateHTMLEstimate(estimate: EstimateData, options: PDFExportOptions): string {
    const date = new Date().toLocaleDateString();
    const estimateNumber = `EST-${Date.now()}`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asphalt Paving Estimate - ${estimateNumber}</title>
    <style>
        ${this.getEstimateStyles()}
    </style>
</head>
<body>
    <div class="estimate-container">
        ${this.generateHeader(estimateNumber, date)}
        
        ${this.generateCustomerSection(estimate.customerInfo)}
        
        ${this.generateProjectSummary(estimate.projectSummary)}
        
        ${options.format !== 'standard' ? this.generateDetailedBreakdown(estimate.breakdown) : ''}
        
        ${options.format === 'comparison' ? this.generateAlternativePricing(estimate.alternatives) : ''}
        
        ${estimate.weightAnalysis && options.format === 'detailed' ? this.generateWeightAnalysis(estimate.weightAnalysis) : ''}
        
        ${this.generateRecommendations(estimate.recommendations)}
        
        ${options.includeTerms ? this.generateTermsAndConditions(estimate.disclaimers) : ''}
        
        ${this.generateFooter(options.customNotes)}
    </div>
</body>
</html>`;
  }

  private getEstimateStyles(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }

        .estimate-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .company-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #22d3ee;
        }

        .estimate-number {
            font-size: 18px;
            background: #22d3ee;
            color: #1e293b;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: bold;
        }

        .company-details {
            font-size: 14px;
            opacity: 0.9;
        }

        .section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 15px;
            border-bottom: 2px solid #22d3ee;
            padding-bottom: 5px;
        }

        .customer-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }

        .info-group h3 {
            font-size: 16px;
            color: #475569;
            margin-bottom: 10px;
        }

        .project-summary {
            background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%);
            color: white;
            text-align: center;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .total-cost {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .summary-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 20px;
        }

        .summary-item h4 {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 5px;
        }

        .summary-item p {
            font-size: 16px;
            font-weight: bold;
        }

        .breakdown-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .breakdown-table th,
        .breakdown-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        .breakdown-table th {
            background: #1e293b;
            color: white;
            font-weight: bold;
        }

        .breakdown-table tr:nth-child(even) {
            background: #f8fafc;
        }

        .total-row {
            background: #22d3ee !important;
            color: white;
            font-weight: bold;
        }

        .alternatives-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .alternative-option {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }

        .alternative-option.recommended {
            border-color: #22d3ee;
            background: #f0fdff;
        }

        .alternative-price {
            font-size: 32px;
            font-weight: bold;
            color: #0891b2;
            margin-bottom: 10px;
        }

        .recommendations ul {
            list-style: none;
            padding: 0;
        }

        .recommendations li {
            background: #f0f9ff;
            border-left: 4px solid #22d3ee;
            padding: 10px 15px;
            margin-bottom: 10px;
            border-radius: 4px;
        }

        .recommendations li:before {
            content: "✓";
            color: #22d3ee;
            font-weight: bold;
            margin-right: 10px;
        }

        .weight-analysis {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
        }

        .weight-warning {
            background: #fee2e2;
            border: 1px solid #ef4444;
            color: #dc2626;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 15px;
        }

        .weight-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-top: 15px;
        }

        .weight-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 4px;
        }

        .weight-value {
            font-size: 20px;
            font-weight: bold;
            color: #1e293b;
        }

        .weight-label {
            font-size: 12px;
            color: #64748b;
            margin-top: 5px;
        }

        .terms {
            font-size: 12px;
            color: #64748b;
            line-height: 1.4;
        }

        .terms h3 {
            color: #1e293b;
            margin-bottom: 10px;
        }

        .terms ul {
            margin-left: 20px;
            margin-bottom: 15px;
        }

        .footer {
            text-align: center;
            padding: 20px;
            border-top: 2px solid #e2e8f0;
            margin-top: 30px;
        }

        .footer-note {
            font-style: italic;
            color: #64748b;
            margin-bottom: 10px;
        }

        .signature-line {
            margin-top: 40px;
            border-top: 1px solid #000;
            width: 300px;
            margin-left: auto;
            margin-right: auto;
            padding-top: 10px;
            text-align: center;
            font-size: 14px;
        }

        @media print {
            .estimate-container {
                max-width: none;
                margin: 0;
                padding: 0;
            }
            
            .section {
                break-inside: avoid;
            }
            
            .header {
                background: #1e293b !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    `;
  }

  private generateHeader(estimateNumber: string, date: string): string {
    return `
        <div class="header">
            <div class="company-info">
                <div>
                    <div class="company-name">Blacktop Solutions LLC</div>
                    <div class="company-details">
                        ${BUSINESS_CONFIG.address}<br>
                        Phone: (276) 555-0123 | Email: info@blacktopsolutions.com<br>
                        Licensed & Insured Virginia Contractor
                    </div>
                </div>
                <div class="estimate-number">${estimateNumber}</div>
            </div>
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: #22d3ee;">
                ASPHALT MAINTENANCE ESTIMATE
            </div>
            <div style="text-align: right; margin-top: 15px;">
                <strong>Date:</strong> ${date}
            </div>
        </div>
    `;
  }

  private generateCustomerSection(customerInfo?: any): string {
    if (!customerInfo) return '';

    return `
        <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="customer-info">
                <div class="info-group">
                    <h3>Customer Details</h3>
                    <p><strong>Name:</strong> ${customerInfo.name || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${customerInfo.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> ${customerInfo.email || 'N/A'}</p>
                </div>
                <div class="info-group">
                    <h3>Project Location</h3>
                    <p><strong>Address:</strong> ${customerInfo.address || 'N/A'}</p>
                </div>
            </div>
        </div>
    `;
  }

  private generateProjectSummary(projectSummary: any): string {
    return `
        <div class="project-summary">
            <div class="total-cost">$${projectSummary.totalCost.toLocaleString()}</div>
            <div style="font-size: 18px; margin-bottom: 20px;">
                ${projectSummary.description}
            </div>
            <div class="summary-details">
                <div class="summary-item">
                    <h4>Project Timeline</h4>
                    <p>${projectSummary.timeline}</p>
                </div>
                <div class="summary-item">
                    <h4>Estimate Valid Until</h4>
                    <p>${projectSummary.validUntil}</p>
                </div>
                <div class="summary-item">
                    <h4>Professional Service</h4>
                    <p>Licensed & Insured</p>
                </div>
            </div>
        </div>
    `;
  }

  private generateDetailedBreakdown(breakdown: any): string {
    return `
        <div class="section">
            <div class="section-title">Detailed Cost Breakdown</div>
            <table class="breakdown-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Materials</strong></td>
                        <td>Sealcoat, sand, additives, crack filler</td>
                        <td>$${breakdown.materials.grandTotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Labor</strong></td>
                        <td>Preparation, application, cleanup</td>
                        <td>$${breakdown.labor.total.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Equipment</strong></td>
                        <td>Sealcoating machine, tools</td>
                        <td>$${breakdown.equipment.total.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Fuel & Transportation</strong></td>
                        <td>Equipment operation, travel costs</td>
                        <td>$${breakdown.fuel.total.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Mobilization</strong></td>
                        <td>Setup and breakdown</td>
                        <td>$${breakdown.mobilization.toFixed(2)}</td>
                    </tr>
                    <tr style="border-top: 2px solid #1e293b;">
                        <td><strong>Subtotal</strong></td>
                        <td></td>
                        <td><strong>$${breakdown.subtotal.toFixed(2)}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Overhead (15%)</strong></td>
                        <td>Insurance, licensing, admin</td>
                        <td>$${breakdown.overhead.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Profit (20%)</strong></td>
                        <td>Business profit margin</td>
                        <td>$${breakdown.profit.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>TOTAL ESTIMATE</strong></td>
                        <td></td>
                        <td><strong>$${breakdown.total.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
  }

  private generateAlternativePricing(alternatives: any): string {
    return `
        <div class="section">
            <div class="section-title">Alternative Pricing Options</div>
            <div class="alternatives-grid">
                <div class="alternative-option">
                    <h3>Standard Pricing</h3>
                    <div class="alternative-price">$${alternatives.withMarkup25.total.toFixed(2)}</div>
                    <p>25% markup on base costs</p>
                    <small>Our standard pricing model</small>
                </div>
                <div class="alternative-option recommended">
                    <h3>Rounded Pricing</h3>
                    <div class="alternative-price">$${alternatives.roundedUp.total.toFixed(2)}</div>
                    <p>${alternatives.roundedUp.markupPercentage.toFixed(1)}% total markup</p>
                    <small><strong>Recommended</strong> - Simplified pricing</small>
                </div>
            </div>
        </div>
    `;
  }

  private generateWeightAnalysis(weightAnalysis: any): string {
    const warnings = weightAnalysis.warnings || [];
    
    return `
        <div class="section">
            <div class="section-title">Vehicle Weight Analysis</div>
            ${warnings.length > 0 ? `
                <div class="weight-warning">
                    <strong>⚠️ Weight Considerations:</strong><br>
                    ${warnings.map((warning: string) => `• ${warning}`).join('<br>')}
                </div>
            ` : ''}
            <div class="weight-grid">
                <div class="weight-item">
                    <div class="weight-value">${weightAnalysis.vehicleWeight.toLocaleString()}</div>
                    <div class="weight-label">Vehicle Weight (lbs)</div>
                </div>
                <div class="weight-item">
                    <div class="weight-value">${weightAnalysis.equipmentWeight.toLocaleString()}</div>
                    <div class="weight-label">Equipment Weight (lbs)</div>
                </div>
                <div class="weight-item">
                    <div class="weight-value">${weightAnalysis.totalWeight.toLocaleString()}</div>
                    <div class="weight-label">Total Weight (lbs)</div>
                </div>
                <div class="weight-item">
                    <div class="weight-value ${weightAnalysis.safetyMargin > 10 ? '' : 'color: #ef4444;'}">${weightAnalysis.safetyMargin.toFixed(1)}%</div>
                    <div class="weight-label">Safety Margin</div>
                </div>
            </div>
            <p style="margin-top: 15px; font-size: 12px; color: #64748b;">
                <strong>Note:</strong> Weight calculations based on 1978 Chevy C30 specifications. 
                GVWR: ${weightAnalysis.gvwr.toLocaleString()} lbs. Multiple trips may be required for larger projects.
            </p>
        </div>
    `;
  }

  private generateRecommendations(recommendations: string[]): string {
    if (!recommendations.length) return '';

    return `
        <div class="section recommendations">
            <div class="section-title">Professional Recommendations</div>
            <ul>
                ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    `;
  }

  private generateTermsAndConditions(disclaimers: string[]): string {
    return `
        <div class="section terms">
            <div class="section-title">Terms & Conditions</div>
            
            <h3>Payment Terms</h3>
            <ul>
                <li>50% deposit required upon contract signing</li>
                <li>Remaining balance due upon project completion</li>
                <li>Payment accepted: Cash, Check, or Credit Card</li>
                <li>Late payments subject to 1.5% monthly service charge</li>
            </ul>
            
            <h3>Work Guarantee</h3>
            <ul>
                <li>All workmanship guaranteed for 1 year from completion date</li>
                <li>Materials guaranteed per manufacturer specifications</li>
                <li>Weather-related delays may affect timeline</li>
            </ul>
            
            <h3>Important Notes</h3>
            <ul>
                ${disclaimers.map(disclaimer => `<li>${disclaimer}</li>`).join('')}
            </ul>
            
            <h3>License & Insurance</h3>
            <p>Blacktop Solutions LLC is fully licensed and insured in the Commonwealth of Virginia. 
            Certificate of insurance available upon request. All work performed in accordance with 
            Virginia Department of Transportation standards and local regulations.</p>
        </div>
    `;
  }

  private generateFooter(customNotes?: string): string {
    return `
        <div class="footer">
            ${customNotes ? `
                <div class="footer-note">
                    <strong>Additional Notes:</strong> ${customNotes}
                </div>
            ` : ''}
            
            <p style="font-size: 14px; margin-bottom: 20px;">
                Thank you for considering Blacktop Solutions LLC for your asphalt maintenance needs. 
                We look forward to working with you!
            </p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px;">
                <div>
                    <strong>Questions?</strong><br>
                    Call: (276) 555-0123<br>
                    Email: info@blacktopsolutions.com
                </div>
                <div class="signature-line">
                    Authorized Representative<br>
                    Blacktop Solutions LLC
                </div>
            </div>
            
            <div style="margin-top: 30px; font-size: 12px; color: #64748b;">
                This estimate was generated on ${new Date().toLocaleDateString()} using 
                Blacktop Blackout Professional Estimation System v1.0
            </div>
        </div>
    `;
  }

  // Additional utility method for invoice generation
  async generateInvoicePDF(estimate: EstimateData, invoiceNumber: string): Promise<string> {
    logger.info('Generating invoice PDF', { invoiceNumber });

    // Convert estimate to invoice format
    const invoiceData = {
      ...estimate,
      invoiceNumber,
      invoiceDate: new Date().toLocaleDateString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 30 days
      status: 'PENDING'
    };

    // Generate invoice-specific HTML (simplified for brevity)
    const htmlContent = this.generateHTMLEstimate(invoiceData, { 
      format: 'detailed', 
      includeImages: false, 
      includeTerms: true 
    });

    return htmlContent.replace('ASPHALT MAINTENANCE ESTIMATE', `INVOICE #${invoiceNumber}`);
  }
}