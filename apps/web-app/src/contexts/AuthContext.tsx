import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'operator'
  company_id: string
  company_name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'))
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('authToken')
      if (savedToken) {
        try {
          // Verify token with backend
          const userData = await authApi.verifyToken(savedToken)
          setUser(userData)
          setToken(savedToken)
        } catch (error) {
          console.error('Token verification failed:', error)
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
          setToken(null)
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  // Setup token refresh timer
  useEffect(() => {
    if (!token) return

    const refreshToken = async () => {
      try {
        const refreshTokenValue = localStorage.getItem('refreshToken')
        if (!refreshTokenValue) {
          throw new Error('No refresh token')
        }

        const response = await authApi.refreshToken(refreshTokenValue)
        setToken(response.token)
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('refreshToken', response.refreshToken)
      } catch (error) {
        console.error('Token refresh failed:', error)
        logout()
      }
    }

    // Refresh token every 45 minutes (tokens expire in 1 hour)
    const interval = setInterval(refreshToken, 45 * 60 * 1000)

    return () => clearInterval(interval)
  }, [token])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authApi.login({ email, password })
      
      setUser(response.user)
      setToken(response.token)
      
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      navigate('/')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}