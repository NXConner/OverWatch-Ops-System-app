import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Eye, 
  BarChart3, 
  Truck, 
  Package, 
  Users, 
  Settings,
  Shield,
  Menu,
  X
} from 'lucide-react'
import { useTerminology } from '../contexts/TerminologyContext'
import { useAuth } from '../contexts/AuthContext'
import { TerminologyToggle } from './TerminologyToggle'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { translate } = useTerminology()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { 
      name: translate('Dashboard', 'Dashboard'), 
      href: '/', 
      icon: LayoutDashboard 
    },
    { 
      name: translate('OverWatch-Ops', 'Operations Center'), 
      href: '/overwatch', 
      icon: Eye 
    },
    { 
      name: translate('Analytics', 'Analytics'), 
      href: '/analytics', 
      icon: BarChart3 
    },
    { 
      name: translate('Fleet', 'Fleet'), 
      href: '/fleet', 
      icon: Truck 
    },
    { 
      name: translate('Materials', 'Materials'), 
      href: '/materials', 
      icon: Package 
    },
    { 
      name: translate('Personnel', 'Employees'), 
      href: '/employees', 
      icon: Users 
    },
    { 
      name: translate('Settings', 'Settings'), 
      href: '/settings', 
      icon: Settings 
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-surface border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-gradient">Blacktop</h1>
              <p className="text-xs text-muted-foreground">Blackout</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${isActive(item.href) 
                    ? 'bg-primary text-primary-foreground shadow-glow' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User info and terminology toggle */}
        <div className="p-4 border-t border-border">
          <TerminologyToggle />
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
            <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            <button
              onClick={logout}
              className="mt-2 text-xs text-red-400 hover:text-red-300"
            >
              {translate('Sign Out', 'Sign Out')}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-background/80 backdrop-blur-md border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-4">
            {/* Add top bar items here if needed */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}