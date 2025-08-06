import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  emit: (event: string, data?: any) => void
  on: (event: string, callback: (data: any) => void) => void
  off: (event: string, callback?: (data: any) => void) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const { token, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setConnected(false)
      }
      return
    }

    // Create socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3333', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    })

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setConnected(true)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnected(false)
    })

    // Set up real-time event listeners
    newSocket.on('location:update', (data) => {
      console.log('Location update received:', data)
      // Handle location updates
    })

    newSocket.on('cost:update', (data) => {
      console.log('Cost update received:', data)
      // Handle cost updates
    })

    newSocket.on('alert:weather', (data) => {
      console.log('Weather alert received:', data)
      // Handle weather alerts
    })

    newSocket.on('alert:geofence', (data) => {
      console.log('Geofence alert received:', data)
      // Handle geofence violations
    })

    newSocket.on('scan:completed', (data) => {
      console.log('Scan completed:', data)
      // Handle completed pavement scans
    })

    newSocket.on('defect:detected', (data) => {
      console.log('Defect detected:', data)
      // Handle new defect detections
    })

    setSocket(newSocket)

    // Cleanup on unmount or dependency change
    return () => {
      newSocket.off('connect')
      newSocket.off('disconnect')
      newSocket.off('connect_error')
      newSocket.off('location:update')
      newSocket.off('cost:update')
      newSocket.off('alert:weather')
      newSocket.off('alert:geofence')
      newSocket.off('scan:completed')
      newSocket.off('defect:detected')
      newSocket.disconnect()
    }
  }, [isAuthenticated, token])

  const emit = (event: string, data?: any) => {
    if (socket && connected) {
      socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
    }
  }

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback)
      } else {
        socket.off(event)
      }
    }
  }

  const value: SocketContextType = {
    socket,
    connected,
    emit,
    on,
    off,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}