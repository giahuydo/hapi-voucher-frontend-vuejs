<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to {{ appName }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">Manage your voucher system</p>
      </div>

      <form class="mt-8 space-y-4" @submit.prevent="handleLogin" :class="{ 'opacity-50 pointer-events-none': authStore.loading }">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="authStore.error" class="rounded-md bg-red-50 p-4 border border-red-200">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Login Failed
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ authStore.error }}
              </div>
            </div>
            <div class="ml-auto pl-3">
              <div class="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  @click="authStore.clearError()"
                  class="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  <span class="sr-only">Dismiss</span>
                  <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"          >
            <span v-if="authStore.loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </span>
            {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <!-- API Info -->
        <div class="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 class="text-sm font-medium text-blue-800 mb-2">API Connection:</h3>
          <p class="text-sm text-blue-700">
            Connecting to: {{ apiBaseUrl }}<br />
            Make sure your Hapi Voucher API is running on port 3000
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Router and stores
const router = useRouter()
const authStore = useAuthStore()

// App name and API info
const appName = import.meta.env.VITE_APP_NAME || 'Hapi Voucher'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Form state
const form = reactive({
  email: 'giahuydo1379@gmail.com',
  password: '132456',
})

// Methods
const handleLogin = async () => {
  try {
    authStore.clearError()
    await authStore.login(form.email, form.password)
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>
