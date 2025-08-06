import React, { createContext, useContext, useState, useEffect } from 'react'

type TerminologyMode = 'military' | 'civilian' | 'both'

interface TerminologyContextType {
  mode: TerminologyMode
  setMode: (mode: TerminologyMode) => void
  translate: (military: string, civilian: string) => string
}

const TerminologyContext = createContext<TerminologyContextType | undefined>(undefined)

export const useTerminology = () => {
  const context = useContext(TerminologyContext)
  if (context === undefined) {
    throw new Error('useTerminology must be used within a TerminologyProvider')
  }
  return context
}

// Dictionary for common terms
const terminologyDictionary = {
  // Personnel
  'personnel': { military: 'Personnel', civilian: 'Employees' },
  'unit': { military: 'Unit', civilian: 'Team' },
  'deployment': { military: 'Deployment', civilian: 'Assignment' },
  'mission': { military: 'Mission', civilian: 'Project' },
  'operation': { military: 'Operation', civilian: 'Job' },
  'command': { military: 'Command', civilian: 'Management' },
  'sector': { military: 'Sector', civilian: 'Area' },
  'patrol': { military: 'Patrol', civilian: 'Route' },
  'base': { military: 'Base', civilian: 'Office' },
  'field': { military: 'Field', civilian: 'Site' },
  
  // Equipment
  'assets': { military: 'Assets', civilian: 'Equipment' },
  'vehicle': { military: 'Vehicle', civilian: 'Truck' },
  'equipment': { military: 'Equipment', civilian: 'Tools' },
  'logistics': { military: 'Logistics', civilian: 'Supplies' },
  'arsenal': { military: 'Arsenal', civilian: 'Inventory' },
  
  // Operations
  'intel': { military: 'Intel', civilian: 'Information' },
  'recon': { military: 'Recon', civilian: 'Survey' },
  'status': { military: 'Status', civilian: 'Update' },
  'sitrep': { military: 'SITREP', civilian: 'Status Report' },
  'coordinates': { military: 'Coordinates', civilian: 'Location' },
  'target': { military: 'Target', civilian: 'Destination' },
  'objective': { military: 'Objective', civilian: 'Goal' },
  
  // Time/Schedule
  'eta': { military: 'ETA', civilian: 'Arrival Time' },
  'deployment_time': { military: 'Deployment Time', civilian: 'Start Time' },
  'mission_duration': { military: 'Mission Duration', civilian: 'Job Duration' },
  
  // Status/Alerts
  'green': { military: 'Green', civilian: 'Good' },
  'yellow': { military: 'Yellow', civilian: 'Caution' },
  'red': { military: 'Red', civilian: 'Alert' },
  'offline': { military: 'Offline', civilian: 'Unavailable' },
  'online': { military: 'Online', civilian: 'Available' },
  'standby': { military: 'Standby', civilian: 'Ready' },
  
  // Roles
  'commander': { military: 'Commander', civilian: 'Manager' },
  'operator': { military: 'Operator', civilian: 'Worker' },
  'specialist': { military: 'Specialist', civilian: 'Technician' },
  
  // System specific
  'overwatch': { military: 'OverWatch', civilian: 'Monitoring' },
  'surveillance': { military: 'Surveillance', civilian: 'Tracking' },
  'perimeter': { military: 'Perimeter', civilian: 'Boundary' },
  'zone': { military: 'Zone', civilian: 'Area' },
}

export const TerminologyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<TerminologyMode>(() => {
    const saved = localStorage.getItem('terminology-mode')
    return (saved as TerminologyMode) || 'civilian'
  })

  useEffect(() => {
    localStorage.setItem('terminology-mode', mode)
  }, [mode])

  const setMode = (newMode: TerminologyMode) => {
    setModeState(newMode)
  }

  const translate = (military: string, civilian: string) => {
    switch (mode) {
      case 'military':
        return military
      case 'civilian':
        return civilian
      case 'both':
        return `${military} (${civilian})`
      default:
        return civilian
    }
  }

  // Enhanced translate function that can look up terms from dictionary
  const translateTerm = (key: string, fallbackMilitary?: string, fallbackCivilian?: string) => {
    const term = terminologyDictionary[key as keyof typeof terminologyDictionary]
    
    if (term) {
      return translate(term.military, term.civilian)
    }
    
    // Fallback to provided terms
    if (fallbackMilitary && fallbackCivilian) {
      return translate(fallbackMilitary, fallbackCivilian)
    }
    
    // Return original key if no translation found
    return key
  }

  const value: TerminologyContextType = {
    mode,
    setMode,
    translate: translateTerm,
  }

  return <TerminologyContext.Provider value={value}>{children}</TerminologyContext.Provider>
}