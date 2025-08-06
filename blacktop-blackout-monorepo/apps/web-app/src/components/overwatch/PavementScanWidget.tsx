import React from 'react'
import { Scan, Camera, AlertTriangle } from 'lucide-react'

export const PavementScanWidget: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="text-center p-6 border-2 border-dashed border-border rounded-lg">
        <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          3D Scanning & AI Defect Detection
        </p>
        <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90">
          Start New Scan
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Recent Scans</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <div className="text-sm">Job Site A - Parking Lot</div>
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              <span className="text-xs">7 defects</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <div className="text-sm">Main Street Driveway</div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-green-500">Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}