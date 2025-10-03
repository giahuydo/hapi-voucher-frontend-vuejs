<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Initialize auth store
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initializeAuth()
})

// Show loading screen while initializing
const showLoading = computed(() => authStore.initializing)
</script>

<template>
  <!-- Loading screen while auth is initializing -->
  <div v-if="showLoading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-sm text-gray-600">Initializing...</p>
    </div>
  </div>

  <!-- Main app content -->
  <RouterView v-else />
</template>
