import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type User } from '@/services/auth'

// User interface is now imported from auth service

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)
  const initializing = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null

      // Call real API
      const response = await authService.login({ email, password })
      const { user: userData, token: authToken } = response

      user.value = userData
      token.value = authToken
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))

      return { user: userData, token: authToken }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed'
      error.value = errorMessage

      // Auto clear error after 5 seconds
      setTimeout(() => {
        if (error.value === errorMessage) {
          error.value = null
        }
      }, 5000)

      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      // Call API to logout
      await authService.logout()
    } catch (err) {
      console.error('Logout API error:', err)
    } finally {
      // Clear local state regardless of API call result
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  const initializeAuth = async () => {
    // Prevent multiple initializations
    if (initialized.value || initializing.value) {
      console.log('🔄 Auth already initialized or initializing, skipping...')
      return
    }

    initializing.value = true

    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        console.log('🔄 Initializing auth from stored data...')
        token.value = storedToken
        user.value = JSON.parse(storedUser)

        // Try to verify token is still valid by calling API
        // If API is not available, keep the stored data
        try {
          const currentUser = await authService.getCurrentUser()
          user.value = currentUser
          localStorage.setItem('user', JSON.stringify(currentUser))
          console.log('✅ Auth initialized successfully with API verification')
        } catch (apiErr) {
          console.warn('⚠️ API verification failed, keeping stored data:', apiErr)
          // Keep stored data if API is not available
          console.log('✅ Auth initialized with stored data (API unavailable)')
        }
      } catch (err) {
        console.error('❌ Error initializing auth:', err)
        // Only clear auth state if there's a critical error
        if (err instanceof SyntaxError) {
          // JSON parse error - clear invalid data
          user.value = null
          token.value = null
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
        }
        // For other errors, keep the stored data
      }
    } else {
      console.log('🔄 No stored auth data found')
    }

    initialized.value = true
    initializing.value = false
  }

  const clearError = () => {
    error.value = null
  }

    return {
      // State
      user,
      token,
      loading,
      error,
      initialized,
      initializing,

      // Getters
      isAuthenticated,
      isAdmin,

      // Actions
      login,
      logout,
      initializeAuth,
      clearError
    }
})
