import React from 'react'
import { Eye, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTerminology } from '../contexts/TerminologyContext'

export const Dashboard: React.FC = () => {
  const { translate } = useTerminology()

  return (
    <div className="p-6 space-y-6">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="hero-title mb-6">
          Welcome to {translate('OverWatch-Ops', 'Operations Center')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your comprehensive asphalt operations intelligence platform is ready for deployment.
        </p>
        
        <Link 
          to="/overwatch"
          className="inline-flex items-center space-x-2 bg-gradient-primary text-primary-foreground font-medium py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-glow text-lg"
        >
          <Eye className="h-6 w-6" />
          <span>{translate('Access OverWatch', 'Open Operations Center')}</span>
          <ArrowRight className="h-6 w-6" />
        </Link>
      </div>
    </div>
  )
}