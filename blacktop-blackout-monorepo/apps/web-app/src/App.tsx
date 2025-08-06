import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { TerminologyProvider } from './contexts/TerminologyContext'
import { SocketProvider } from './contexts/SocketContext'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { OverWatch } from './pages/OverWatch'
import { GeminiEstimator } from './pages/GeminiEstimator'
import { Analytics } from './pages/Analytics'
import { Fleet } from './pages/Fleet'
import { Materials } from './pages/Materials'
import { Employees } from './pages/Employees'
import { Settings } from './pages/Settings'
import { ProtectedRoute } from './components/ProtectedRoute'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TerminologyProvider>
          <SocketProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route index element={<Dashboard />} />
                            <Route path="/overwatch" element={<OverWatch />} />
                            <Route path="/gemini-estimator" element={<GeminiEstimator />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/fleet" element={<Fleet />} />
                            <Route path="/materials" element={<Materials />} />
                            <Route path="/employees" element={<Employees />} />
                            <Route path="/settings" element={<Settings />} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </Router>
          </SocketProvider>
        </TerminologyProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App