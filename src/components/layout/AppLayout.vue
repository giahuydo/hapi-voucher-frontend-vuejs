<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            © {{ currentYear }} {{ appName }}. All rights reserved.
          </div>
          <div class="text-sm text-gray-500">
            Version {{ appVersion }}
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from './AppHeader.vue'

// Props
const appName = import.meta.env.VITE_APP_NAME || 'Hapi Voucher'
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'

// Computed
const currentYear = computed(() => new Date().getFullYear())
</script>
