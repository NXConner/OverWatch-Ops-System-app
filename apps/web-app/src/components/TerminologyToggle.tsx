import React from 'react'
import { useTerminology } from '../contexts/TerminologyContext'
import { Shield, User, Users } from 'lucide-react'

export const TerminologyToggle: React.FC = () => {
  const { mode, setMode } = useTerminology()

  const modes = [
    { value: 'military', label: 'Military', icon: <Shield className="h-3 w-3" /> },
    { value: 'civilian', label: 'Civilian', icon: <User className="h-3 w-3" /> },
    { value: 'both', label: 'Both', icon: <Users className="h-3 w-3" /> }
  ] as const

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Terminology Mode
      </label>
      <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-lg">
        {modes.map((modeOption) => (
          <button
            key={modeOption.value}
            onClick={() => setMode(modeOption.value)}
            className={`
              flex items-center justify-center space-x-1 px-2 py-1 text-xs font-medium rounded transition-colors duration-200
              ${mode === modeOption.value 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {modeOption.icon}
            <span>{modeOption.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}