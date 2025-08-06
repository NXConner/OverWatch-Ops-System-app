import React, { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Scan, 
  Camera, 
  AlertTriangle, 
  Play, 
  Square, 
  Download, 
  Upload,
  FileText,
  Map,
  Ruler,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  Activity
} from 'lucide-react'
import { useTerminology } from '../../contexts/TerminologyContext'

interface DefectData {
  id: string
  type: 'crack' | 'pothole' | 'alligator' | 'water_pooling' | 'thermal'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: { x: number; y: number }
  measurements: {
    length?: number
    width?: number
    depth?: number
    area?: number
  }
  confidence: number
  estimatedCost: number
}

interface ScanData {
  id: string
  location: string
  timestamp: Date
  status: 'scanning' | 'processing' | 'completed' | 'failed'
  area: number
  perimeter: number
  defects: DefectData[]
  modelPath?: string
  progress?: number
}

export const PavementScanWidget: React.FC = () => {
  const { translate } = useTerminology()
  const [isScanning, setIsScanning] = useState(false)
  const [currentScan, setCurrentScan] = useState<ScanData | null>(null)
  const [scans, setScans] = useState<ScanData[]>([
    {
      id: '1',
      location: 'Job Site A - Parking Lot',
      timestamp: new Date('2024-08-06T10:30:00'),
      status: 'completed',
      area: 2450,
      perimeter: 198,
      defects: [
        {
          id: 'd1',
          type: 'crack',
          severity: 'medium',
          location: { x: 45, y: 67 },
          measurements: { length: 12.5, width: 0.5 },
          confidence: 0.87,
          estimatedCost: 125.50
        },
        {
          id: 'd2',
          type: 'pothole',
          severity: 'high',
          location: { x: 78, y: 23 },
          measurements: { length: 18, width: 15, depth: 3 },
          confidence: 0.94,
          estimatedCost: 275.00
        },
        {
          id: 'd3',
          type: 'water_pooling',
          severity: 'low',
          location: { x: 23, y: 89 },
          measurements: { area: 8.5 },
          confidence: 0.76,
          estimatedCost: 85.00
        }
      ]
    },
    {
      id: '2',
      location: 'Main Street Driveway',
      timestamp: new Date('2024-08-06T09:15:00'),
      status: 'completed',
      area: 850,
      perimeter: 124,
      defects: []
    }
  ])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startScan = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Camera access not supported on this device')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      const newScan: ScanData = {
        id: Date.now().toString(),
        location: 'Current Location',
        timestamp: new Date(),
        status: 'scanning',
        area: 0,
        perimeter: 0,
        defects: [],
        progress: 0
      }

      setCurrentScan(newScan)
      setIsScanning(true)

      // Simulate scanning progress
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          clearInterval(progressInterval)
          
          // Simulate processing
          setTimeout(() => {
            const processedScan: ScanData = {
              ...newScan,
              status: 'processing',
              area: 1850 + Math.random() * 500,
              perimeter: 160 + Math.random() * 40
            }
            setCurrentScan(processedScan)

            // Simulate AI analysis completion
            setTimeout(() => {
              const completedScan: ScanData = {
                ...processedScan,
                status: 'completed',
                defects: generateMockDefects()
              }
              setCurrentScan(completedScan)
              setScans(prev => [completedScan, ...prev])
            }, 3000)
          }, 2000)
        } else {
          setCurrentScan(prev => prev ? { ...prev, progress } : null)
        }
      }, 500)

    } catch (error) {
      console.error('Error starting scan:', error)
      alert('Failed to access camera')
    }
  }, [])

  const stopScan = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
    setCurrentScan(null)
  }, [])

  const generateMockDefects = (): DefectData[] => {
    const defectTypes: DefectData['type'][] = ['crack', 'pothole', 'alligator', 'water_pooling']
    const severities: DefectData['severity'][] = ['low', 'medium', 'high']
    const defectCount = Math.floor(Math.random() * 8) + 1

    return Array.from({ length: defectCount }, (_, i) => ({
      id: `d${Date.now()}-${i}`,
      type: defectTypes[Math.floor(Math.random() * defectTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      location: { 
        x: Math.random() * 100, 
        y: Math.random() * 100 
      },
      measurements: {
        length: Math.random() * 20 + 5,
        width: Math.random() * 5 + 0.5,
        depth: Math.random() * 4 + 0.5,
        area: Math.random() * 15 + 2
      },
      confidence: Math.random() * 0.3 + 0.7,
      estimatedCost: Math.random() * 400 + 50
    }))
  }

  const getDefectIcon = (type: DefectData['type']) => {
    switch (type) {
      case 'crack': return '🔥'
      case 'pothole': return '🕳️'
      case 'alligator': return '🐊'
      case 'water_pooling': return '💧'
      case 'thermal': return '🌡️'
      default: return '⚠️'
    }
  }

  const getSeverityColor = (severity: DefectData['severity']) => {
    switch (severity) {
      case 'low': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-orange-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: ScanData['status']) => {
    switch (status) {
      case 'scanning': return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'processing': return <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Scanning Interface */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {translate('PavementScan Pro', 'PavementScan Pro')}
          </h3>
          <div className="flex items-center space-x-2">
            <Scan className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered 3D Analysis</span>
          </div>
        </div>

        {!isScanning ? (
          <div className="text-center p-6 border-2 border-dashed border-border rounded-lg">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              {translate('3D Scanning & AI Defect Detection', '3D Scanning & AI Defect Detection')}
            </p>
            <div className="space-y-2 mb-4">
              <div className="text-xs text-muted-foreground">Features:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-primary/10 rounded">ARKit/ARCore</span>
                <span className="px-2 py-1 bg-primary/10 rounded">LiDAR Support</span>
                <span className="px-2 py-1 bg-primary/10 rounded">AI Analysis</span>
                <span className="px-2 py-1 bg-primary/10 rounded">3D Models</span>
              </div>
            </div>
            <button 
              onClick={startScan}
              className="flex items-center space-x-2 bg-primary text-primary-foreground py-3 px-6 rounded-lg text-sm font-medium hover:bg-primary/90 mx-auto"
            >
              <Play className="h-4 w-4" />
              <span>{translate('Start 3D Scan', 'Start 3D Scan')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video Preview */}
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-48 bg-black rounded-lg object-cover"
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="text-center text-white">
                  <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <div className="text-sm font-medium">
                    {currentScan?.status === 'scanning' && `${translate('Scanning', 'Scanning')}... ${currentScan.progress?.toFixed(0) || 0}%`}
                    {currentScan?.status === 'processing' && translate('Processing 3D Model...', 'Processing 3D Model...')}
                    {currentScan?.status === 'completed' && translate('Scan Complete!', 'Scan Complete!')}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {currentScan && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{translate('Scan Progress', 'Scan Progress')}</span>
                  <span>{currentScan.progress?.toFixed(0) || 0}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentScan.progress || 0}%` }}
                  />
                </div>
              </div>
            )}

            <button 
              onClick={stopScan}
              className="flex items-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-600 w-full justify-center"
            >
              <Square className="h-4 w-4" />
              <span>{translate('Stop Scan', 'Stop Scan')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Current Scan Results */}
      {currentScan?.status === 'completed' && (
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold flex items-center space-x-2">
            <Target className="h-4 w-4 text-primary" />
            <span>{translate('Scan Results', 'Scan Results')}</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">{translate('Total Area', 'Total Area')}</div>
              <div className="font-bold text-primary">{currentScan.area.toFixed(0)} sq ft</div>
            </div>
            <div>
              <div className="text-muted-foreground">{translate('Perimeter', 'Perimeter')}</div>
              <div className="font-bold text-accent">{currentScan.perimeter.toFixed(0)} ft</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">
              {translate('Defects Detected', 'Defects Found')}: {currentScan.defects.length}
            </div>
            {currentScan.defects.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {currentScan.defects.map(defect => (
                  <div key={defect.id} className="flex items-center justify-between p-2 bg-background rounded text-xs">
                    <div className="flex items-center space-x-2">
                      <span>{getDefectIcon(defect.type)}</span>
                      <span className="capitalize">{defect.type.replace('_', ' ')}</span>
                      <span className={`capitalize ${getSeverityColor(defect.severity)}`}>
                        {defect.severity}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${defect.estimatedCost.toFixed(2)}</div>
                      <div className="text-muted-foreground">{(defect.confidence * 100).toFixed(0)}% conf.</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-green-500">
                <CheckCircle className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm">No defects detected!</div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center space-x-1 bg-primary text-primary-foreground py-2 px-3 rounded text-xs">
              <Download className="h-3 w-3" />
              <span>Export Report</span>
            </button>
            <button className="flex-1 flex items-center justify-center space-x-1 bg-accent text-accent-foreground py-2 px-3 rounded text-xs">
              <Map className="h-3 w-3" />
              <span>View 3D Model</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Scans */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {translate('Recent Scans', 'Recent Scans')}
        </h4>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {scans.map(scan => (
            <div key={scan.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {getStatusIcon(scan.status)}
                  <span className="text-sm font-medium truncate">{scan.location}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {scan.timestamp.toLocaleDateString()} • {scan.area.toFixed(0)} sq ft
                </div>
                {scan.defects.length > 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-yellow-500">
                      {scan.defects.length} {translate('defects', 'defects')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • ${scan.defects.reduce((sum, d) => sum + d.estimatedCost, 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                <button className="p-1 hover:bg-background rounded">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                </button>
                <button className="p-1 hover:bg-background rounded">
                  <Download className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Statistics */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {scans.reduce((total, scan) => total + scan.defects.length, 0)}
          </div>
          <div className="text-xs text-muted-foreground">
            {translate('Total Defects', 'Total Defects')}
          </div>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-accent">
            {scans.reduce((total, scan) => total + scan.area, 0).toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">
            {translate('Sq Ft Scanned', 'Sq Ft Scanned')}
          </div>
        </div>
      </div>
    </div>
  )
}