<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useEventStore } from '@/stores/event'
import type { CreateEventRequest } from '@/services/event'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import ConfirmModal from './ConfirmModal.vue'

// Props
interface Props {
  isOpen: boolean
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  created: [event: unknown]
}>()

// Stores
const eventStore = useEventStore()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const showConfirmModal = ref(false)

// Form data
const form = reactive({
  name: '',
  description: '',
  maxQuantity: 1,
  isActive: true
})

// Methods
const handleCreate = () => {
  showConfirmModal.value = true
}

const confirmCreate = async () => {
  try {
    loading.value = true
    error.value = null

    console.log('🔄 Creating new event:', form)

    const createData: CreateEventRequest = {
      name: form.name,
      description: form.description,
      maxQuantity: form.maxQuantity,
      isActive: form.isActive
    }

    console.log('📝 Create data:', createData)

    const newEvent = await eventStore.createEvent(createData)
    console.log('✅ Event created successfully:', newEvent)

    // Reset form
    resetForm()

    emit('created', newEvent)
    emit('close')
  } catch (err: unknown) {
    console.error('❌ Error creating event:', err)
    error.value = (err as Error).message || 'Failed to create event'
  } finally {
    loading.value = false
    showConfirmModal.value = false
  }
}

const cancelCreate = () => {
  showConfirmModal.value = false
}

const handleClose = () => {
  error.value = null
  resetForm()
  emit('close')
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.maxQuantity = 1
  form.isActive = true
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}
</script>

<template>
  <!-- Modal Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @keydown="handleKeydown"
    tabindex="-1"
  >
    <div class="flex min-h-screen items-center justify-center p-4">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="handleClose"
      ></div>

      <!-- Modal Content -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Create New Event
          </h3>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleCreate" class="p-6 space-y-4">
          <!-- Error Message -->
          <div v-if="error" class="rounded-md bg-red-50 p-4 border border-red-200">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <!-- Event Name -->
          <div>
            <label for="event-name" class="block text-sm font-medium text-gray-700 mb-1">
              Event Name *
            </label>
            <input
              id="event-name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter event name"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="event-description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="event-description"
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter event description"
            ></textarea>
          </div>

          <!-- Max Quantity -->
          <div>
            <label for="max-quantity" class="block text-sm font-medium text-gray-700 mb-1">
              Max Quantity *
            </label>
            <input
              id="max-quantity"
              v-model.number="form.maxQuantity"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter max quantity"
            />
          </div>

          <!-- Status -->
          <div class="flex items-center">
            <input
              id="event-active"
              v-model="form.isActive"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="event-active" class="ml-2 block text-sm text-gray-900">
              Event is active
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="handleClose"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
              <span v-else>Create Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :is-open="showConfirmModal"
      title="Create Event"
      message="Are you sure you want to create this new event?"
      confirm-text="Create Event"
      cancel-text="Cancel"
      type="info"
      :loading="loading"
      @confirm="confirmCreate"
      @cancel="cancelCreate"
    />
  </div>
</template>
