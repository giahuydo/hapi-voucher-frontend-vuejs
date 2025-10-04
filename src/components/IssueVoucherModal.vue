<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useVoucherStore } from '@/stores/voucher'
import { useEventStore } from '@/stores/event'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import ConfirmModal from './ConfirmModal.vue'

// Props
interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  issued: [voucher: unknown]
}>()

// Stores
const voucherStore = useVoucherStore()
const eventStore = useEventStore()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const showConfirmModal = ref(false)
const eventsLoading = ref(false)

// Form data
const form = reactive({
  eventId: '',
  issueTo: ''
})

// Computed
const availableEvents = computed(() => {
  return eventStore.events.filter(event =>
    event.isActive && event.issuedCount < event.maxQuantity
  )
})

const selectedEvent = computed(() => {
  return eventStore.events.find(event => event.id === form.eventId)
})

const remainingSlots = computed(() => {
  if (!selectedEvent.value) return 0
  return selectedEvent.value.maxQuantity - selectedEvent.value.issuedCount
})

// Methods
const handleIssue = () => {
  if (!form.eventId) {
    error.value = 'Please select an event'
    return
  }
  if (!form.issueTo.trim()) {
    error.value = 'Please enter recipient email'
    return
  }
  showConfirmModal.value = true
}

const confirmIssue = async () => {
  try {
    loading.value = true
    error.value = null

    console.log('🔄 Issuing voucher for event:', form.eventId)
    console.log('📧 Issued to:', form.issueTo)

    const issueData = {
      eventId: form.eventId,
      issueTo: form.issueTo.trim()
    }

    console.log('📝 Issue data:', issueData)

    const newVoucher = await voucherStore.createVoucher(issueData)
    console.log('✅ Voucher issued successfully:', newVoucher)

    // Refresh events data to update issuedCount
    await eventStore.fetchEvents()
    console.log('✅ Events data refreshed')

    // Reset form
    resetForm()

    emit('issued', newVoucher)
    emit('close')
  } catch (err: unknown) {
    console.error('❌ Error issuing voucher:', err)
    error.value = (err as Error).message || 'Failed to issue voucher'
  } finally {
    loading.value = false
    showConfirmModal.value = false
  }
}

const cancelIssue = () => {
  showConfirmModal.value = false
}

const handleClose = () => {
  error.value = null
  resetForm()
  emit('close')
}

const resetForm = () => {
  form.eventId = ''
  form.issueTo = ''
}

const loadEvents = async () => {
  try {
    eventsLoading.value = true
    await eventStore.fetchEvents()
  } catch (err) {
    console.error('Error loading events:', err)
    error.value = 'Failed to load events'
  } finally {
    eventsLoading.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}

// Load events when modal opens
onMounted(() => {
  loadEvents()
})

// Watch for modal open/close to refresh events
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Refresh events data when modal opens to get latest issuedCount
    loadEvents()
  }
})
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
            Issue Voucher
          </h3>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleIssue" class="p-6 space-y-4">
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

          <!-- Event Selection -->
          <div>
            <label for="event-select" class="block text-sm font-medium text-gray-700 mb-1">
              Select Event *
            </label>
            <div v-if="eventsLoading" class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <p class="mt-2 text-sm text-gray-500">Loading events...</p>
            </div>
            <select
              v-else
              id="event-select"
              v-model="form.eventId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choose an event...</option>
              <option
                v-for="event in availableEvents"
                :key="event.id"
                :value="event.id"
              >
                {{ event.name }} ({{ event.issuedCount }}/{{ event.maxQuantity }} slots)
              </option>
            </select>
            <p v-if="availableEvents.length === 0 && !eventsLoading" class="mt-1 text-sm text-gray-500">
              No active events with available slots
            </p>
          </div>

          <!-- Event Details (if selected) -->
          <div v-if="selectedEvent" class="bg-gray-50 p-4 rounded-md">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Event Details</h4>
            <div class="space-y-1 text-sm text-gray-600">
              <p><strong>Name:</strong> {{ selectedEvent.name }}</p>
              <p><strong>Description:</strong> {{ selectedEvent.description }}</p>
              <p><strong>Available Slots:</strong> {{ remainingSlots }} remaining</p>
            </div>
          </div>

          <!-- Recipient Email -->
          <div>
            <label for="recipient-email" class="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email *
            </label>
            <input
              id="recipient-email"
              v-model="form.issueTo"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter recipient email address"
            />
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
              :disabled="loading || !form.eventId || !form.issueTo.trim()"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Issuing...
              </span>
              <span v-else>Issue Voucher</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :is-open="showConfirmModal"
      title="Issue Voucher"
      :message="`Are you sure you want to issue a voucher for '${selectedEvent?.name}' to '${form.issueTo}'?`"
      confirm-text="Issue Voucher"
      cancel-text="Cancel"
      type="info"
      :loading="loading"
      @confirm="confirmIssue"
      @cancel="cancelIssue"
    />
  </div>
</template>
