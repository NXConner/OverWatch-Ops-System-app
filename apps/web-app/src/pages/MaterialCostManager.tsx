import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Edit3, 
  Save, 
  X, 
  AlertCircle, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Package,
  Truck,
  CheckCircle,
  History,
  Download,
  Upload
} from 'lucide-react'
import { useTerminology } from '../contexts/TerminologyContext'
import { useAuth } from '../contexts/AuthContext'

interface MaterialCost {
  id: string
  category: 'sealcoat' | 'crackfilling' | 'linestriping' | 'fuel'
  name: string
  description: string
  unit: string
  currentPrice: number
  supplierPrice: number
  lastUpdated: string
  supplier: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

interface PriceHistory {
  date: string
  price: number
  updatedBy: string
  notes?: string
}

interface SupplierInfo {
  name: string
  address: string
  contact: string
  lastContact: string
  reliability: 'high' | 'medium' | 'low'
}

const INITIAL_MATERIALS: MaterialCost[] = [
  {
    id: 'pmm-concentrate',
    category: 'sealcoat',
    name: 'PMM Asphalt Sealer Concentrate',
    description: 'SealMaster PMM concentrate, premium grade',
    unit: 'gallon',
    currentPrice: 3.79,
    supplierPrice: 3.79,
    lastUpdated: new Date().toISOString(),
    supplier: 'SealMaster',
    trend: 'stable',
    changePercent: 0
  },
  {
    id: 'sand-50lb',
    category: 'sealcoat',
    name: 'Sand (50lb bag)',
    description: 'Fine sand for sealcoat mixture',
    unit: 'bag',
    currentPrice: 10.00,
    supplierPrice: 10.00,
    lastUpdated: new Date().toISOString(),
    supplier: 'SealMaster',
    trend: 'stable',
    changePercent: 0
  },
  {
    id: 'prep-seal',
    category: 'sealcoat',
    name: 'Prep Seal (5-gallon)',
    description: 'Oil spot primer, 5-gallon bucket',
    unit: 'bucket',
    currentPrice: 50.00,
    supplierPrice: 50.00,
    lastUpdated: new Date().toISOString(),
    supplier: 'SealMaster',
    trend: 'stable',
    changePercent: 0
  },
  {
    id: 'fast-dry',
    category: 'sealcoat',
    name: 'Fast Dry Additive (5-gallon)',
    description: 'FASS-DRI PSA, 5-gallon bucket',
    unit: 'bucket',
    currentPrice: 50.00,
    supplierPrice: 50.00,
    lastUpdated: new Date().toISOString(),
    supplier: 'SealMaster',
    trend: 'stable',
    changePercent: 0
  },
  {
    id: 'crack-master',
    category: 'crackfilling',
    name: 'CrackMaster Crackfiller (30lb)',
    description: 'Parking Lot LP, 30lb box',
    unit: 'box',
    currentPrice: 44.95,
    supplierPrice: 44.95,
    lastUpdated: new Date().toISOString(),
    supplier: 'SealMaster',
    trend: 'stable',
    changePercent: 0
  },
  {
    id: 'propane-tank',
    category: 'crackfilling',
    name: 'Propane Tank Refill',
    description: 'Hot pour machine fuel',
    unit: 'tank',
    currentPrice: 10.00,
    supplierPrice: 10.00,
    lastUpdated: new Date().toISOString(),
    supplier: 'Local',
    trend: 'stable',
    changePercent: 0
  },
  {
    id: 'line-paint',
    category: 'linestriping',
    name: 'Line Striping Paint',
    description: 'Premium traffic paint',
    unit: 'linear foot',
    currentPrice: 0.85,
    supplierPrice: 0.85,
    lastUpdated: new Date().toISOString(),
    supplier: 'SealMaster',
    trend: 'stable',
    changePercent: 0
  },
  {
    id: 'diesel-fuel',
    category: 'fuel',
    name: 'Diesel Fuel',
    description: 'Equipment and transportation fuel',
    unit: 'gallon',
    currentPrice: 3.45,
    supplierPrice: 3.45,
    lastUpdated: new Date().toISOString(),
    supplier: 'Local',
    trend: 'up',
    changePercent: 2.5
  }
]

const SUPPLIER_INFO: SupplierInfo = {
  name: 'SealMaster',
  address: '703 West Decatur Street, Madison, NC 27025',
  contact: '(336) 427-3888',
  lastContact: new Date().toISOString().split('T')[0],
  reliability: 'high'
}

// API service for material cost management
class MaterialCostAPI {
  private baseURL = '/api/estimation'

  async updateMaterialCost(material: string, newPrice: number, effectiveDate: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/material-cost-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ material, newPrice, effectiveDate })
    })

    if (!response.ok) {
      throw new Error('Failed to update material cost')
    }

    return response.json()
  }

  async getBusinessConfig(): Promise<any> {
    const response = await fetch(`${this.baseURL}/business-config`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch business config')
    }

    return response.json()
  }
}

const materialCostAPI = new MaterialCostAPI()

export const MaterialCostManager: React.FC = () => {
  const { translate } = useTerminology()
  const { user } = useAuth()
  
  const [materials, setMaterials] = useState<MaterialCost[]>(INITIAL_MATERIALS)
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const [priceHistory, setPriceHistory] = useState<{ [key: string]: PriceHistory[] }>({})
  const [supplierInfo, setSupplierInfo] = useState<SupplierInfo>(SUPPLIER_INFO)
  const [isUpdating, setIsUpdating] = useState(false)

  // Load material data on mount
  useEffect(() => {
    loadMaterialData()
    loadPriceHistory()
  }, [])

  const loadMaterialData = async () => {
    try {
      // In production, load from API
      const saved = localStorage.getItem('material_costs')
      if (saved) {
        setMaterials(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load material data:', error)
    }
  }

  const loadPriceHistory = () => {
    const saved = localStorage.getItem('price_history')
    if (saved) {
      setPriceHistory(JSON.parse(saved))
    }
  }

  const saveMaterialData = (updatedMaterials: MaterialCost[]) => {
    setMaterials(updatedMaterials)
    localStorage.setItem('material_costs', JSON.stringify(updatedMaterials))
  }

  const savePriceHistory = (history: { [key: string]: PriceHistory[] }) => {
    setPriceHistory(history)
    localStorage.setItem('price_history', JSON.stringify(history))
  }

  const handleEditPrice = (materialId: string, currentPrice: number) => {
    setEditingMaterial(materialId)
    setEditPrice(currentPrice.toString())
  }

  const handleSavePrice = async (materialId: string) => {
    setIsUpdating(true)
    try {
      const newPrice = parseFloat(editPrice)
      if (isNaN(newPrice) || newPrice <= 0) {
        alert('Please enter a valid price')
        return
      }

      const material = materials.find(m => m.id === materialId)
      if (!material) return

      // Update via API if user has admin permissions
      if (user?.role === 'admin') {
        await materialCostAPI.updateMaterialCost(
          material.name,
          newPrice,
          new Date().toISOString()
        )
      }

      // Calculate price change
      const oldPrice = material.currentPrice
      const changePercent = ((newPrice - oldPrice) / oldPrice) * 100
      const trend = changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable'

      // Update material
      const updatedMaterials = materials.map(m => 
        m.id === materialId 
          ? { 
              ...m, 
              currentPrice: newPrice,
              supplierPrice: newPrice,
              lastUpdated: new Date().toISOString(),
              changePercent: Math.abs(changePercent),
              trend
            }
          : m
      )

      // Add to price history
      const newHistoryEntry: PriceHistory = {
        date: new Date().toISOString(),
        price: newPrice,
        updatedBy: user?.email || 'Unknown',
        notes: `Updated from $${oldPrice.toFixed(2)} to $${newPrice.toFixed(2)}`
      }

      const updatedHistory = {
        ...priceHistory,
        [materialId]: [newHistoryEntry, ...(priceHistory[materialId] || [])].slice(0, 10) // Keep last 10 entries
      }

      saveMaterialData(updatedMaterials)
      savePriceHistory(updatedHistory)

      setEditingMaterial(null)
      setEditPrice('')

    } catch (error) {
      console.error('Failed to update price:', error)
      alert('Failed to update price. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingMaterial(null)
    setEditPrice('')
  }

  const exportPricingData = () => {
    const exportData = {
      materials,
      priceHistory,
      supplierInfo,
      exportDate: new Date().toISOString(),
      exportedBy: user?.email
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `material-costs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const importPricingData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        if (importedData.materials && Array.isArray(importedData.materials)) {
          saveMaterialData(importedData.materials)
          if (importedData.priceHistory) {
            savePriceHistory(importedData.priceHistory)
          }
          alert('Pricing data imported successfully!')
        } else {
          alert('Invalid file format')
        }
      } catch (error) {
        alert('Failed to import data: Invalid JSON format')
      }
    }
    reader.readAsText(file)
  }

  const filteredMaterials = filterCategory === 'all' 
    ? materials 
    : materials.filter(m => m.category === filterCategory)

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-400" />
      case 'down': return <TrendingUp className="w-4 h-4 text-green-400 rotate-180" />
      default: return <div className="w-4 h-4 rounded-full bg-gray-400" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sealcoat': return 'bg-blue-600'
      case 'crackfilling': return 'bg-orange-600'
      case 'linestriping': return 'bg-purple-600'
      case 'fuel': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-100">
      {/* Header */}
      <div className="bg-slate-900 border-b border-cyan-800/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold text-cyan-100">
                  {translate('Material Cost Manager')}
                </h1>
                <p className="text-slate-400">
                  Virginia pricing & supplier management
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={exportPricingData}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  
                  <label className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={importPricingData}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Supplier Information */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-lg p-6 border border-cyan-800/30 mb-6">
              <h2 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Primary Supplier
              </h2>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-400">Company</div>
                  <div className="text-cyan-100 font-medium">{supplierInfo.name}</div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-400">Address</div>
                  <div className="text-cyan-100 text-sm">{supplierInfo.address}</div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-400">Contact</div>
                  <div className="text-cyan-100">{supplierInfo.contact}</div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-400">Last Contact</div>
                  <div className="text-cyan-100">{supplierInfo.lastContact}</div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-400">Reliability</div>
                  <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                    supplierInfo.reliability === 'high' ? 'bg-green-900 text-green-200' :
                    supplierInfo.reliability === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-red-900 text-red-200'
                  }`}>
                    {supplierInfo.reliability.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-slate-900 rounded-lg p-6 border border-cyan-800/30">
              <h3 className="text-lg font-semibold text-cyan-100 mb-4">
                Filter by Category
              </h3>
              
              <div className="space-y-2">
                {['all', 'sealcoat', 'crackfilling', 'linestriping', 'fuel'].map(category => (
                  <button
                    key={category}
                    onClick={() => setFilterCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filterCategory === category
                        ? 'bg-cyan-900/30 border border-cyan-600 text-cyan-100'
                        : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-100'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Materials List */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 rounded-lg border border-cyan-800/30">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-cyan-100">
                  Material Costs & Pricing
                </h2>
                <p className="text-slate-400 mt-1">
                  Current pricing from suppliers • Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {filteredMaterials.map(material => (
                    <div
                      key={material.id}
                      className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getCategoryColor(material.category)}`} />
                            <h3 className="text-lg font-medium text-cyan-100">
                              {material.name}
                            </h3>
                            {getTrendIcon(material.trend)}
                            {material.changePercent > 0 && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                material.trend === 'up' ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
                              }`}>
                                {material.trend === 'up' ? '+' : '-'}{material.changePercent.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          
                          <p className="text-slate-400 text-sm mb-3">
                            {material.description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-xs text-slate-400">Current Price</div>
                              {editingMaterial === material.id ? (
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-cyan-100 text-sm focus:border-cyan-500 focus:outline-none"
                                  />
                                  <span className="text-slate-400 text-sm">/{material.unit}</span>
                                </div>
                              ) : (
                                <div className="text-lg font-semibold text-cyan-100">
                                  ${material.currentPrice.toFixed(2)}/{material.unit}
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <div className="text-xs text-slate-400">Supplier</div>
                              <div className="text-cyan-100">{material.supplier}</div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-slate-400">Last Updated</div>
                              <div className="text-cyan-100">
                                {new Date(material.lastUpdated).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-slate-400">Category</div>
                              <div className="text-cyan-100 capitalize">{material.category}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {editingMaterial === material.id ? (
                            <>
                              <button
                                onClick={() => handleSavePrice(material.id)}
                                disabled={isUpdating}
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                {isUpdating ? (
                                  <>Saving...</>
                                ) : (
                                  <>
                                    <Save className="w-3 h-3" />
                                    Save
                                  </>
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex items-center gap-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                <X className="w-3 h-3" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              {user?.role === 'admin' && (
                                <button
                                  onClick={() => handleEditPrice(material.id, material.currentPrice)}
                                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => setShowHistory(showHistory === material.id ? null : material.id)}
                                className="flex items-center gap-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                <History className="w-3 h-3" />
                                History
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Price History */}
                      {showHistory === material.id && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <h4 className="text-sm font-medium text-cyan-100 mb-3">Price History</h4>
                          {priceHistory[material.id]?.length > 0 ? (
                            <div className="space-y-2">
                              {priceHistory[material.id].slice(0, 5).map((entry, index) => (
                                <div key={index} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-3">
                                    <span className="text-slate-400">
                                      {new Date(entry.date).toLocaleDateString()}
                                    </span>
                                    <span className="text-cyan-100 font-medium">
                                      ${entry.price.toFixed(2)}
                                    </span>
                                    <span className="text-slate-400">
                                      by {entry.updatedBy}
                                    </span>
                                  </div>
                                  {entry.notes && (
                                    <span className="text-slate-500">{entry.notes}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-slate-400 text-sm">No price history available</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}