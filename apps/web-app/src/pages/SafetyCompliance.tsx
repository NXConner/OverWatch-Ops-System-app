import React, { useState, useEffect, useRef } from 'react'
import {
  Shield, AlertTriangle, FileText, Book, ExternalLink,
  Download, Search, Filter, Eye, CheckCircle, XCircle,
  Truck, HardHat, Zap, Droplets, Wind, Thermometer,
  Users, Clock, MapPin, Phone, Globe, ShoppingCart,
  Star, Heart, Activity, Settings, Wrench
} from 'lucide-react'
import { useTerminology } from '../contexts/TerminologyContext'

interface SafetyStandard {
  id: string
  title: string
  category: 'federal' | 'state' | 'local' | 'industry'
  authority: string
  regulation: string
  description: string
  requirements: string[]
  penalties: string
  lastUpdated: Date
  isActive: boolean
}

interface MaterialSpec {
  id: string
  name: string
  manufacturer: string
  productCode: string
  category: 'sealcoat' | 'additive' | 'equipment' | 'safety'
  description: string
  specifications: Record<string, any>
  safetyData: {
    hazards: string[]
    ppe: string[]
    firstAid: string[]
    storage: string
    disposal: string
  }
  applicationGuide: {
    coverage: string
    mixingRatio: string
    temperature: string
    weather: string
    curing: string
  }
  documents: {
    dataSheet?: string
    sds?: string
    applicationGuide?: string
    warranty?: string
  }
  pricing?: {
    unitPrice: number
    unit: string
    bulkDiscounts: Array<{ quantity: number; discount: number }>
  }
}

interface CatalogItem {
  id: string
  name: string
  category: string
  imageUrl: string
  description: string
  price: string
  availability: 'in-stock' | 'limited' | 'out-of-stock'
  rating: number
  reviews: number
  url: string
}

export const SafetyCompliance: React.FC = () => {
  const { translate } = useTerminology()
  const [activeTab, setActiveTab] = useState<'standards' | 'materials' | 'catalog' | 'training'>('standards')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [safetyStandards, setSafetyStandards] = useState<SafetyStandard[]>([])
  const [materialSpecs, setMaterialSpecs] = useState<MaterialSpec[]>([])
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialSpec | null>(null)
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    loadSafetyData()
  }, [])

  const loadSafetyData = async () => {
    try {
      setLoading(true)
      setSafetyStandards(getDefaultSafetyStandards())
      setMaterialSpecs(getDefaultMaterialSpecs())
      setCatalogItems(getDefaultCatalogItems())
    } catch (error) {
      console.error('Failed to load safety data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultSafetyStandards = (): SafetyStandard[] => [
    {
      id: '1',
      title: 'OSHA Hazard Communication Standard',
      category: 'federal',
      authority: 'OSHA',
      regulation: '29 CFR 1910.1200',
      description: 'Requirements for chemical hazard communication, labeling, and safety data sheets',
      requirements: [
        'Maintain Safety Data Sheets (SDS) for all hazardous chemicals',
        'Ensure proper chemical labeling and container identification',
        'Provide employee training on chemical hazards',
        'Implement written hazard communication program',
        'Update chemical inventory annually'
      ],
      penalties: 'Up to $15,625 per violation (serious), up to $156,259 per violation (willful/repeated)',
      lastUpdated: new Date('2023-01-01'),
      isActive: true
    },
    {
      id: '2',
      title: 'OSHA Personal Protective Equipment',
      category: 'federal',
      authority: 'OSHA',
      regulation: '29 CFR 1926.95-106',
      description: 'Construction industry PPE requirements for head, eye, face, hand, and foot protection',
      requirements: [
        'Conduct PPE hazard assessment for each job site',
        'Provide appropriate PPE at no cost to employees',
        'Train employees on proper PPE use and maintenance',
        'Ensure PPE meets ANSI standards',
        'Document PPE training and inspections'
      ],
      penalties: 'Up to $15,625 per violation (serious), up to $156,259 per violation (willful/repeated)',
      lastUpdated: new Date('2023-01-01'),
      isActive: true
    },
    {
      id: '3',
      title: 'Virginia Department of Labor and Industry',
      category: 'state',
      authority: 'VDOLI',
      regulation: 'Virginia Code § 40.1-49.4',
      description: 'Virginia Occupational Safety and Health (VOSH) standards for workplace safety',
      requirements: [
        'Register with VDOLI for construction operations',
        'Comply with Virginia-specific safety standards',
        'Report workplace injuries within 24 hours',
        'Maintain VOSH compliance records',
        'Conduct regular safety inspections'
      ],
      penalties: 'Up to $15,625 per violation (serious), criminal penalties for willful violations',
      lastUpdated: new Date('2023-06-01'),
      isActive: true
    },
    {
      id: '4',
      title: 'Virginia Department of Environmental Quality',
      category: 'state',
      authority: 'DEQ',
      regulation: '9VAC20-60',
      description: 'Solid waste management regulations and stormwater pollution prevention',
      requirements: [
        'Obtain stormwater pollution prevention permit',
        'Implement erosion and sediment controls',
        'Proper disposal of waste materials',
        'Prevent discharge of pollutants to waterways',
        'Maintain spill prevention and response plans'
      ],
      penalties: 'Up to $10,000 per day per violation, stop work orders',
      lastUpdated: new Date('2023-03-15'),
      isActive: true
    },
    {
      id: '5',
      title: 'Patrick County Building Code',
      category: 'local',
      authority: 'Patrick County',
      regulation: 'Patrick County Code Ch. 18',
      description: 'Local building and construction standards for Stuart, VA area',
      requirements: [
        'Obtain building permits for applicable work',
        'Schedule required inspections',
        'Comply with setback requirements',
        'Follow noise ordinance restrictions',
        'Proper traffic control during operations'
      ],
      penalties: 'Fines up to $500 per violation, stop work orders',
      lastUpdated: new Date('2023-01-01'),
      isActive: true
    },
    {
      id: '6',
      title: 'NAPA Seal Coat Best Practices',
      category: 'industry',
      authority: 'NAPA',
      regulation: 'IS-111',
      description: 'National Asphalt Pavement Association seal coat application standards',
      requirements: [
        'Follow proper surface preparation procedures',
        'Use appropriate application rates',
        'Maintain equipment to manufacturer specifications',
        'Monitor weather conditions during application',
        'Implement quality control testing procedures'
      ],
      penalties: 'Loss of certification, industry reputation damage',
      lastUpdated: new Date('2023-01-01'),
      isActive: true
    },
    {
      id: '7',
      title: 'EPA Chemical Safety Requirements',
      category: 'federal',
      authority: 'EPA',
      regulation: '40 CFR 68',
      description: 'Risk Management Program for chemical accident prevention',
      requirements: [
        'Register chemicals above threshold quantities',
        'Develop process safety management plans',
        'Conduct hazard assessments',
        'Implement emergency response procedures',
        'Train employees on chemical safety'
      ],
      penalties: 'Up to $25,000 per day per violation, criminal penalties possible',
      lastUpdated: new Date('2023-01-01'),
      isActive: true
    }
  ]

  const getDefaultMaterialSpecs = (): MaterialSpec[] => [
    {
      id: '1',
      name: 'SealMaster PMM Concentrate',
      manufacturer: 'SealMaster',
      productCode: 'PMM-100',
      category: 'sealcoat',
      description: 'Premium polymer-modified coal tar emulsion concentrate for driveway and parking lot sealing',
      specifications: {
        viscosity: '90-120 KU @ 25°C',
        solids: '55-60%',
        ph: '11.5-12.5',
        freezeThaw: 'Stable to 5 cycles',
        coverage: '80-100 sq ft per gallon',
        shelfLife: '12 months'
      },
      safetyData: {
        hazards: [
          'May cause skin and eye irritation',
          'Harmful if swallowed',
          'Contains coal tar - potential carcinogen',
          'Slippery when wet'
        ],
        ppe: [
          'Safety glasses or goggles',
          'Chemical-resistant gloves',
          'Long sleeves and pants',
          'Non-slip footwear'
        ],
        firstAid: [
          'Eye contact: Flush with water for 15 minutes',
          'Skin contact: Wash with soap and water',
          'Ingestion: Do not induce vomiting, seek medical attention',
          'Inhalation: Move to fresh air'
        ],
        storage: 'Store in cool, dry place. Protect from freezing. Keep containers tightly closed.',
        disposal: 'Dispose of in accordance with local, state, and federal regulations. Do not pour down drains.'
      },
      applicationGuide: {
        coverage: '80-100 sq ft per gallon mixed material',
        mixingRatio: '3-4 gallons water per 5 gallons concentrate',
        temperature: 'Air and surface temp 50°F-90°F',
        weather: 'No rain for 4 hours before and 4 hours after application',
        curing: 'Allow 4-6 hours drying time before traffic'
      },
      documents: {
        dataSheet: '/docs/sealmaster-pmm-datasheet.pdf',
        sds: '/docs/sealmaster-pmm-sds.pdf',
        applicationGuide: '/docs/sealmaster-application-guide.pdf',
        warranty: '/docs/sealmaster-warranty.pdf'
      },
      pricing: {
        unitPrice: 3.79,
        unit: 'gallon',
        bulkDiscounts: [
          { quantity: 50, discount: 0.05 },
          { quantity: 100, discount: 0.10 },
          { quantity: 500, discount: 0.15 }
        ]
      }
    },
    {
      id: '2',
      name: 'Silica Sand 50lb',
      manufacturer: 'Various',
      productCode: 'SAND-50',
      category: 'additive',
      description: 'Premium silica sand additive for enhanced traction and durability',
      specifications: {
        gradation: '30-60 mesh',
        silicaContent: '>95%',
        moisture: '<0.5%',
        angularity: 'Sub-angular to angular',
        coverage: '1 bag per 6 gallons sealer'
      },
      safetyData: {
        hazards: [
          'Crystalline silica - may cause lung damage',
          'Dust may cause respiratory irritation',
          'Heavy bag - lifting hazard'
        ],
        ppe: [
          'N95 dust mask minimum (P100 preferred)',
          'Safety glasses',
          'Work gloves',
          'Long sleeves when handling'
        ],
        firstAid: [
          'Inhalation: Move to fresh air, seek medical attention if breathing difficulty',
          'Eye contact: Flush with water for 15 minutes',
          'Skin contact: Wash with soap and water'
        ],
        storage: 'Store in dry area on pallets. Protect from moisture.',
        disposal: 'Non-hazardous. Can be disposed of in regular waste.'
      },
      applicationGuide: {
        coverage: '1 bag per 6 gallons of mixed sealer',
        mixingRatio: 'Add gradually while mixing to prevent clumping',
        temperature: 'No temperature restrictions',
        weather: 'Keep dry until use',
        curing: 'No additional curing time required'
      },
      documents: {
        dataSheet: '/docs/silica-sand-datasheet.pdf',
        sds: '/docs/silica-sand-sds.pdf'
      },
      pricing: {
        unitPrice: 10.00,
        unit: '50lb bag',
        bulkDiscounts: [
          { quantity: 20, discount: 0.05 },
          { quantity: 50, discount: 0.10 }
        ]
      }
    },
    {
      id: '3',
      name: 'CrackMaster Filler',
      manufacturer: 'SealMaster',
      productCode: 'CM-200',
      category: 'sealcoat',
      description: 'Rubberized asphalt emulsion for crack filling and minor repairs',
      specifications: {
        viscosity: '1500-2500 cP @ 25°C',
        solids: '65-70%',
        elongation: '>300%',
        adhesion: 'Excellent to clean surfaces',
        flexibility: 'Remains flexible to -10°F'
      },
      safetyData: {
        hazards: [
          'May cause skin irritation',
          'Harmful if swallowed',
          'Slippery when wet'
        ],
        ppe: [
          'Safety glasses',
          'Chemical-resistant gloves',
          'Non-slip footwear'
        ],
        firstAid: [
          'Eye contact: Flush with water for 15 minutes',
          'Skin contact: Wash with soap and water',
          'Ingestion: Seek medical attention'
        ],
        storage: 'Store above 32°F. Do not allow to freeze.',
        disposal: 'Dispose of according to local regulations.'
      },
      applicationGuide: {
        coverage: 'Varies by crack width and depth',
        mixingRatio: 'Ready to use - no mixing required',
        temperature: 'Surface temp 50°F minimum',
        weather: 'No rain for 2 hours after application',
        curing: 'Allow 2-4 hours before sealing over'
      },
      documents: {
        dataSheet: '/docs/crackmaster-datasheet.pdf',
        sds: '/docs/crackmaster-sds.pdf',
        applicationGuide: '/docs/crackmaster-application.pdf'
      },
      pricing: {
        unitPrice: 44.95,
        unit: 'gallon',
        bulkDiscounts: [
          { quantity: 10, discount: 0.05 },
          { quantity: 25, discount: 0.10 }
        ]
      }
    }
  ]

  const getDefaultCatalogItems = (): CatalogItem[] => [
    {
      id: '1',
      name: 'SealMaster PMM Concentrate',
      category: 'Sealcoat Materials',
      imageUrl: 'https://www.sealmaster.net/images/products/pmm-concentrate.jpg',
      description: 'Premium polymer-modified coal tar emulsion',
      price: '$3.79/gal',
      availability: 'in-stock',
      rating: 4.8,
      reviews: 142,
      url: 'https://www.sealmaster.net/products/pmm-concentrate'
    },
    {
      id: '2',
      name: 'SealMaster Oil Spot Primer',
      category: 'Primers & Additives',
      imageUrl: 'https://www.sealmaster.net/images/products/oil-spot-primer.jpg',
      description: 'Fast-drying primer for oil-stained surfaces',
      price: '$89.95/gal',
      availability: 'in-stock',
      rating: 4.6,
      reviews: 87,
      url: 'https://www.sealmaster.net/products/oil-spot-primer'
    },
    {
      id: '3',
      name: 'Mix Tank 300 Gallon',
      category: 'Equipment',
      imageUrl: 'https://www.sealmaster.net/images/products/mix-tank-300.jpg',
      description: 'Heavy-duty mixing tank with paddle agitator',
      price: '$2,895.00',
      availability: 'limited',
      rating: 4.9,
      reviews: 34,
      url: 'https://www.sealmaster.net/products/mix-tank-300'
    },
    {
      id: '4',
      name: 'Spray System Pro',
      category: 'Equipment',
      imageUrl: 'https://www.sealmaster.net/images/products/spray-system-pro.jpg',
      description: 'Professional spray application system',
      price: '$4,299.00',
      availability: 'in-stock',
      rating: 4.7,
      reviews: 56,
      url: 'https://www.sealmaster.net/products/spray-system-pro'
    },
    {
      id: '5',
      name: 'Fast Dry Additive',
      category: 'Primers & Additives',
      imageUrl: 'https://www.sealmaster.net/images/products/fast-dry.jpg',
      description: 'Reduces drying time by up to 50%',
      price: '$125.00/gal',
      availability: 'in-stock',
      rating: 4.5,
      reviews: 78,
      url: 'https://www.sealmaster.net/products/fast-dry-additive'
    },
    {
      id: '6',
      name: 'Crack Routing Tool',
      category: 'Tools & Accessories',
      imageUrl: 'https://www.sealmaster.net/images/products/crack-router.jpg',
      description: 'Professional crack preparation tool',
      price: '$189.95',
      availability: 'in-stock',
      rating: 4.4,
      reviews: 23,
      url: 'https://www.sealmaster.net/products/crack-routing-tool'
    }
  ]

  const filteredStandards = safetyStandards.filter(standard => {
    const matchesCategory = selectedCategory === 'all' || standard.category === selectedCategory
    const matchesSearch = 
      standard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      standard.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      standard.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredMaterials = materialSpecs.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory
    const matchesSearch = 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredCatalog = catalogItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'federal': return <Shield className="h-4 w-4 text-blue-600" />
      case 'state': return <MapPin className="h-4 w-4 text-green-600" />
      case 'local': return <Users className="h-4 w-4 text-purple-600" />
      case 'industry': return <Wrench className="h-4 w-4 text-orange-600" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getMaterialIcon = (category: string) => {
    switch (category) {
      case 'sealcoat': return <Droplets className="h-4 w-4 text-blue-600" />
      case 'additive': return <Star className="h-4 w-4 text-yellow-600" />
      case 'equipment': return <Wrench className="h-4 w-4 text-gray-600" />
      case 'safety': return <HardHat className="h-4 w-4 text-red-600" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'in-stock': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'limited': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'out-of-stock': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading safety and compliance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {translate('Safety & Compliance Center', 'Safety Center')}
            </h1>
            <p className="text-muted-foreground">
              OSHA standards, Virginia regulations, and materials optimization
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Compliance Report</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Safety Alert</span>
          </button>
        </div>
      </div>

      {/* Emergency Contact Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Emergency Contacts</h3>
              <p className="text-red-600 text-sm">Keep these numbers readily available</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="font-semibold text-red-800">Emergency</p>
              <p className="text-red-600">911</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-red-800">Poison Control</p>
              <p className="text-red-600">1-800-222-1222</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-red-800">OSHA Hotline</p>
              <p className="text-red-600">1-800-321-6742</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { key: 'standards', label: 'Safety Standards', icon: Shield },
          { key: 'materials', label: 'Materials & Specs', icon: Droplets },
          { key: 'catalog', label: 'SealMaster Catalog', icon: ShoppingCart },
          { key: 'training', label: 'Training & Certification', icon: Book }
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
      {(activeTab === 'standards' || activeTab === 'materials' || activeTab === 'catalog') && (
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
          
          {activeTab === 'standards' && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="all">All Categories</option>
                <option value="federal">Federal (OSHA/EPA)</option>
                <option value="state">Virginia State</option>
                <option value="local">Local (Patrick County)</option>
                <option value="industry">Industry Standards</option>
              </select>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="all">All Materials</option>
                <option value="sealcoat">Sealcoat Materials</option>
                <option value="additive">Additives</option>
                <option value="equipment">Equipment</option>
                <option value="safety">Safety Equipment</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {activeTab === 'standards' && (
        <div className="space-y-4">
          {filteredStandards.map(standard => (
            <div key={standard.id} className="card-enhanced p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-primary">
                    {getCategoryIcon(standard.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{standard.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        standard.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {standard.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {standard.authority}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">{standard.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Key Requirements:</h4>
                        <ul className="text-sm space-y-1">
                          {standard.requirements.map((req, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Penalties:</h4>
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {standard.penalties}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Last updated: {standard.lastUpdated.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="btn-ghost p-2">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button className="btn-ghost p-2">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="space-y-4">
          {filteredMaterials.map(material => (
            <div key={material.id} className="card-enhanced p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-primary">
                    {getMaterialIcon(material.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{material.name}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {material.manufacturer}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {material.productCode}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">{material.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Specifications */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Specifications:</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(material.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground">{key}:</span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Safety Information */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Safety Information:</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-red-600">Hazards:</span>
                            <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                              {material.safetyData.hazards.map((hazard, index) => (
                                <li key={index}>{hazard}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium text-blue-600">Required PPE:</span>
                            <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                              {material.safetyData.ppe.map((ppe, index) => (
                                <li key={index}>{ppe}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Application Guide */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Application Guide:</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(material.applicationGuide).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <p className="text-xs">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    {material.pricing && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-green-800">
                              ${material.pricing.unitPrice.toFixed(2)} per {material.pricing.unit}
                            </span>
                            {material.pricing.bulkDiscounts.length > 0 && (
                              <p className="text-xs text-green-600">
                                Bulk discounts available
                              </p>
                            )}
                          </div>
                          <button className="btn-primary text-sm">
                            Order Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setSelectedMaterial(material)}
                    className="btn-ghost p-2"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {material.documents.dataSheet && (
                    <button className="btn-ghost p-2">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  {material.documents.sds && (
                    <button className="btn-ghost p-2 text-red-500">
                      <AlertTriangle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* SealMaster Website Integration */}
          <div className="card-enhanced p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">SealMaster.net Catalog</h3>
                  <p className="text-muted-foreground">Browse the complete SealMaster product catalog</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => window.open('https://www.sealmaster.net', '_blank')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open in New Tab</span>
                </button>
                <button className="btn-primary flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Quick Order</span>
                </button>
              </div>
            </div>
            
            {/* Embedded Website */}
            <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                ref={iframeRef}
                src="https://www.sealmaster.net"
                className="w-full h-full border-0"
                title="SealMaster Catalog"
                sandbox="allow-same-origin allow-scripts allow-navigation allow-forms"
              />
            </div>
          </div>

          {/* Featured Products */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Featured Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map(item => (
                <div key={item.id} className="card-enhanced p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                      }}
                    />
                    <div className="hidden items-center justify-center w-full h-full">
                      <ShoppingCart className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      {getAvailabilityIcon(item.availability)}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{item.price}</span>
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${
                                i < Math.floor(item.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({item.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => window.open(item.url, '_blank')}
                        className="btn-ghost text-xs flex-1"
                      >
                        View Details
                      </button>
                      <button className="btn-primary text-xs flex-1">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* OSHA Training */}
            <div className="card-enhanced p-6">
              <div className="flex items-center space-x-3 mb-4">
                <HardHat className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">OSHA 30-Hour Construction</h3>
                  <p className="text-sm text-muted-foreground">Required for supervisors</p>
                </div>
              </div>
              <ul className="text-sm space-y-2 mb-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Hazard recognition</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Safety management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>OSHA standards</span>
                </li>
              </ul>
              <div className="flex space-x-2">
                <button className="btn-primary text-sm flex-1">Enroll Now</button>
                <button className="btn-ghost text-sm">Learn More</button>
              </div>
            </div>

            {/* Hazmat Training */}
            <div className="card-enhanced p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold">Hazmat Awareness</h3>
                  <p className="text-sm text-muted-foreground">Chemical safety training</p>
                </div>
              </div>
              <ul className="text-sm space-y-2 mb-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Chemical identification</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Emergency response</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>PPE selection</span>
                </li>
              </ul>
              <div className="flex space-x-2">
                <button className="btn-primary text-sm flex-1">Enroll Now</button>
                <button className="btn-ghost text-sm">Learn More</button>
              </div>
            </div>

            {/* First Aid/CPR */}
            <div className="card-enhanced p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="h-8 w-8 text-red-500" />
                <div>
                  <h3 className="font-semibold">First Aid/CPR</h3>
                  <p className="text-sm text-muted-foreground">Emergency response certification</p>
                </div>
              </div>
              <ul className="text-sm space-y-2 mb-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Basic life support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Wound care</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>AED operation</span>
                </li>
              </ul>
              <div className="flex space-x-2">
                <button className="btn-primary text-sm flex-1">Enroll Now</button>
                <button className="btn-ghost text-sm">Learn More</button>
              </div>
            </div>
          </div>

          {/* Training Schedule */}
          <div className="card-enhanced p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Training Sessions</h3>
            <div className="space-y-3">
              {[
                { date: '2024-01-22', time: '9:00 AM', course: 'OSHA 10-Hour Construction', location: 'Stuart Community Center' },
                { date: '2024-01-25', time: '1:00 PM', course: 'Hazmat Awareness', location: 'Online' },
                { date: '2024-02-01', time: '9:00 AM', course: 'First Aid/CPR', location: 'Fire Station 1' }
              ].map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="font-semibold text-sm">{new Date(session.date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{session.time}</p>
                    </div>
                    <div>
                      <p className="font-medium">{session.course}</p>
                      <p className="text-sm text-muted-foreground">{session.location}</p>
                    </div>
                  </div>
                  <button className="btn-primary text-sm">Register</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Material Detail Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {getMaterialIcon(selectedMaterial.category)}
                  <h2 className="text-2xl font-bold">{selectedMaterial.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="btn-ghost p-2"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="font-semibold mb-3">Product Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Manufacturer:</span>
                        <span>{selectedMaterial.manufacturer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Product Code:</span>
                        <span>{selectedMaterial.productCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="capitalize">{selectedMaterial.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Safety Data */}
                  <div>
                    <h3 className="font-semibold mb-3 text-red-600">Safety Information</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Hazards:</h4>
                        <ul className="text-sm space-y-1">
                          {selectedMaterial.safetyData.hazards.map((hazard, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{hazard}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Required PPE:</h4>
                        <ul className="text-sm space-y-1">
                          {selectedMaterial.safetyData.ppe.map((ppe, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <HardHat className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{ppe}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">First Aid:</h4>
                        <ul className="text-sm space-y-1">
                          {selectedMaterial.safetyData.firstAid.map((aid, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{aid}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Specifications */}
                  <div>
                    <h3 className="font-semibold mb-3">Technical Specifications</h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedMaterial.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Application Guide */}
                  <div>
                    <h3 className="font-semibold mb-3">Application Guide</h3>
                    <div className="space-y-3 text-sm">
                      {Object.entries(selectedMaterial.applicationGuide).map(([key, value]) => (
                        <div key={key}>
                          <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</h4>
                          <p className="text-muted-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h3 className="font-semibold mb-3">Documentation</h3>
                    <div className="space-y-2">
                      {selectedMaterial.documents.dataSheet && (
                        <button className="btn-ghost w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Product Data Sheet
                        </button>
                      )}
                      {selectedMaterial.documents.sds && (
                        <button className="btn-ghost w-full justify-start text-red-600">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Safety Data Sheet
                        </button>
                      )}
                      {selectedMaterial.documents.applicationGuide && (
                        <button className="btn-ghost w-full justify-start">
                          <Book className="h-4 w-4 mr-2" />
                          Application Guide
                        </button>
                      )}
                      {selectedMaterial.documents.warranty && (
                        <button className="btn-ghost w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          Warranty Information
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage and Disposal */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Storage & Disposal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-yellow-700">Storage: </span>
                    <span className="text-yellow-600">{selectedMaterial.safetyData.storage}</span>
                  </div>
                  <div>
                    <span className="font-medium text-yellow-700">Disposal: </span>
                    <span className="text-yellow-600">{selectedMaterial.safetyData.disposal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}