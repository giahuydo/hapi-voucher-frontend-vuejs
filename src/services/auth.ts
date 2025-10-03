import apiClient from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    role: 'admin' | 'user'
    avatar?: string
  }
  token: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  avatar?: string
}

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🚀 Attempting login with:', credentials)
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
      console.log('✅ Login successful:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    }
  },

  // Logout
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me', {
      timeout: 5000 // 5 second timeout
    })
    return response.data
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh')
    return response.data
  }
}
