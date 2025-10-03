<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useEventStore } from '@/stores/event'
import AppLayout from '@/components/layout/AppLayout.vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

// Stores
const eventStore = useEventStore()

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
  // TODO: Implement create event
  console.log('Create new event')
}

const editEvent = (eventId: string) => {
  // TODO: Implement edit event
  console.log('Edit event:', eventId)
}

const deleteEvent = async (eventId: string) => {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await eventStore.deleteEvent(eventId)
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }
}

const viewEvent = (eventId: string) => {
  // Navigate to event detail
  window.location.href = `/events/${eventId}`
}

// Lifecycle
onMounted(async () => {
  await eventStore.fetchEvents()
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
                        class="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <EyeIcon class="h-4 w-4" />
                      </button>
                      <button
                        @click="editEvent(event.id)"
                        class="text-gray-600 hover:text-gray-900"
                        title="Edit Event"
                      >
                        <PencilIcon class="h-4 w-4" />
                      </button>
                      <button
                        @click="deleteEvent(event.id)"
                        class="text-red-600 hover:text-red-900"
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
  </AppLayout>
</template>
