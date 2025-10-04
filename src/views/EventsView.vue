<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useEventStore } from '@/stores/event'
import type { Event } from '@/services/event'
import AppLayout from '@/components/layout/AppLayout.vue'
import EditEventModal from '@/components/EditEventModal.vue'
import CreateEventModal from '@/components/CreateEventModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// Stores
const eventStore = useEventStore()

// Modal state
const showEditModal = ref(false)
const selectedEvent = ref<Event | null>(null)
const showCreateModal = ref(false)
const showDeleteConfirm = ref(false)
const eventToDelete = ref<string | null>(null)
const deleteLoading = ref(false)

// Edit access state
const editAccessLoading = ref(false)
const editAccessError = ref<string | null>(null)

// Computed
const stats = computed(() => [
  {
    name: 'Total Events',
    value: eventStore.total,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'Active Events',
    value: eventStore.activeEvents.length,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    name: 'Inactive Events',
    value: eventStore.inactiveEvents.length,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    name: 'Available Slots',
    value: eventStore.eventsWithAvailableSlots.length,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  }
])

// Methods
const createEvent = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const handleEventCreated = async () => {
  // Refresh events list to show new event
  await eventStore.fetchEvents()
  closeCreateModal()
}

const editEvent = async (eventId: string) => {
  console.log('🔄 Requesting edit access for event ID:', eventId)

  const event = eventStore.events.find(e => e.id === eventId)
  if (!event) {
    console.error('❌ Event not found with ID:', eventId)
    return
  }

  // Check if event is already being edited by current user
  if (eventStore.isEventBeingEdited(eventId)) {
    console.log('✅ Already have edit access, opening modal')
    selectedEvent.value = event
    showEditModal.value = true
    return
  }

  // Check if event is locked by another user
  if (eventStore.isEventLockedByOthers(event)) {
    editAccessError.value = 'This event is currently being edited by another user. Please try again later.'
    return
  }

  // Request edit access
  try {
    editAccessLoading.value = true
    editAccessError.value = null

    const result = await eventStore.requestEditAccess(eventId)

    if (result.success) {
      console.log('✅ Edit access granted, opening modal')
      selectedEvent.value = event
      showEditModal.value = true
    } else {
      editAccessError.value = result.message || 'Failed to get edit access'
    }
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('❌ Error requesting edit access:', error)
    editAccessError.value = err.message || 'Failed to request edit access'
  } finally {
    editAccessLoading.value = false
  }
}

const closeEditModal = async () => {
  // Release edit access when closing modal
  if (selectedEvent.value?.id) {
    await eventStore.releaseEditAccess(selectedEvent.value.id)
  }

  showEditModal.value = false
  selectedEvent.value = null
  editAccessError.value = null
}

const handleEventSaved = async () => {
   await eventStore.fetchEvents()
  // Event is already updated in store, just close modal
  closeEditModal()
}

const deleteEvent = (eventId: string) => {
  eventToDelete.value = eventId
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!eventToDelete.value) return

  try {
    deleteLoading.value = true
    await eventStore.deleteEvent(eventToDelete.value)

    // Refresh events list to show updated data
    await eventStore.fetchEvents()

    showDeleteConfirm.value = false
    eventToDelete.value = null
  } catch (error) {
    console.error('Error deleting event:', error)
  } finally {
    deleteLoading.value = false
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  eventToDelete.value = null
}

const viewEvent = (eventId: string) => {
  // Navigate to event detail
  window.location.href = `/events/${eventId}`
}

// Lifecycle
onMounted(async () => {
  await eventStore.fetchEvents()

  // Release all edit locks when component is unmounted or page is refreshed
  window.addEventListener('beforeunload', () => {
    eventStore.editingEvents.forEach(eventId => {
      eventStore.releaseEditAccess(eventId)
    })
  })
})

// Cleanup on unmount
onUnmounted(() => {
  // Release all edit locks when component is unmounted
  eventStore.editingEvents.forEach(eventId => {
    eventStore.releaseEditAccess(eventId)
  })
})
</script>

<template>
  <AppLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-4 sm:p-5">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Events</h1>
              <p class="text-sm text-gray-500 mt-1">Manage your voucher events</p>
            </div>
            <button
              @click="createEvent"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Create Event
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.name"
          class="bg-white overflow-hidden shadow rounded-lg"
        >
          <div class="p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div :class="[stat.bgColor, 'h-8 w-8 rounded-full flex items-center justify-center']">
                  <div :class="[stat.color, 'h-4 w-4']"></div>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ stat.name }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stat.value }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Access Error Alert -->
      <div v-if="editAccessError" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Edit Access Denied
            </h3>
            <div class="mt-2 text-sm text-red-700">
              {{ editAccessError }}
            </div>
            <div class="mt-4">
              <button
                @click="editAccessError = null"
                class="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Events List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-4 sm:p-5">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-3">All Events</h3>

          <div v-if="eventStore.loading" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <p class="mt-2 text-sm text-gray-500">Loading events...</p>
          </div>

          <div v-else-if="eventStore.events.length === 0" class="text-center py-6">
            <h3 class="mt-2 text-sm font-medium text-gray-900">No events</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
          </div>

          <div v-else class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="event in eventStore.events" :key="event.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <router-link
                      :to="`/events/${event.id}`"
                      class="text-primary-600 hover:text-primary-900 font-medium hover:underline"
                    >
                      {{ event.name }}
                    </router-link>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ event.description }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ event.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ event.issuedCount }}/{{ event.maxQuantity }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="viewEvent(event.id)"
                        class="inline-flex items-center p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                        title="View Details"
                      >
                        <EyeIcon class="h-4 w-4" />
                      </button>
                      <button
                        @click="editEvent(event.id)"
                        :disabled="editAccessLoading || eventStore.isEventLockedByOthers(event)"
                        :class="[
                          'inline-flex items-center p-1.5 rounded-md transition-colors',
                          eventStore.isEventLockedByOthers(event)
                            ? 'text-gray-400 cursor-not-allowed'
                            : eventStore.isEventBeingEdited(event.id)
                            ? 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        ]"
                        :title="eventStore.isEventLockedByOthers(event)
                          ? 'Event is being edited by another user'
                          : eventStore.isEventBeingEdited(event.id)
                          ? 'You are editing this event'
                          : 'Edit Event'"
                      >
                        <LockClosedIcon v-if="eventStore.isEventLockedByOthers(event)" class="h-4 w-4" />
                        <PencilIcon v-else class="h-4 w-4" />
                      </button>
                      <button
                        @click="deleteEvent(event.id)"
                        class="inline-flex items-center p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Event"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Event Modal -->
    <CreateEventModal
      :is-open="showCreateModal"
      @close="closeCreateModal"
      @created="handleEventCreated"
    />

    <!-- Edit Event Modal -->
    <EditEventModal
      :event="selectedEvent"
      :is-open="showEditModal"
      @close="closeEditModal"
      @saved="handleEventSaved"
    />

    <!-- Delete Confirm Modal -->
    <ConfirmModal
      :is-open="showDeleteConfirm"
      title="Delete Event"
      message="Are you sure you want to delete this event? This action cannot be undone."
      confirm-text="Delete Event"
      cancel-text="Cancel"
      type="danger"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </AppLayout>
</template>
