import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    role: 'admin' | 'manager' | 'operator'
    company_id: string
    company_name?: string
  }
  token: string
  refreshToken: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  company_name?: string
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    const response = await api.post('/api/auth/refresh', { refreshToken })
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout')
  },

  verifyToken: async (token: string): Promise<LoginResponse['user']> => {
    const response = await api.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data.user
  },
}

export default api