import React, { useState } from 'react'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@blacktopsolutions.com')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gradient">Blacktop Blackout</h1>
              <p className="text-sm text-muted-foreground">OverWatch-Ops System</p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Advanced operational intelligence platform for asphalt professionals
          </p>
        </div>

        {/* Login form */}
        <div className="card-enhanced p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Access Control</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to access the command center
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-primary text-primary-foreground font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Command Center</span>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            <p>Demo Credentials:</p>
            <p>Email: admin@blacktopsolutions.com</p>
            <p>Password: admin123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>Blacktop Blackout v1.0 - Secure Operations Platform</p>
          <p>© 2024 Blacktop Solutions LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}