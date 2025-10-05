<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from '@/stores/event'
import { useVoucherStore } from '@/stores/voucher'
import AppLayout from '@/components/layout/AppLayout.vue'
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserGroupIcon,
  TicketIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

// Router and stores
const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const voucherStore = useVoucherStore()

// Get event ID from route params
const eventId = computed(() => route.params.id as string)

// Computed
const event = computed(() => eventStore.currentEvent)
const eventVouchers = computed(() =>
  voucherStore.vouchers.filter(voucher => voucher.eventId === eventId.value)
)

const stats = computed(() => [
  {
    name: 'Total Vouchers',
    value: eventVouchers.value.length,
    icon: TicketIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'Used Vouchers',
    value: eventVouchers.value.filter(v => v.isUsed).length,
    icon: UserGroupIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    name: 'Available Slots',
    value: (event.value?.maxQuantity || 0) - (event.value?.issuedCount || 0),
    icon: CalendarIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  }
])

// Methods
const goBack = () => {
  router.go(-1)
}

const editEvent = () => {
  // TODO: Implement edit event
  console.log('Edit event:', eventId.value)
}

const deleteEvent = async () => {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await eventStore.deleteEvent(eventId.value)
      router.push('/')
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }
}

const createVoucher = () => {
  // TODO: Implement create voucher for this event
  console.log('Create voucher for event:', eventId.value)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    eventStore.fetchEvent(eventId.value),
    voucherStore.fetchVouchers({ eventId: eventId.value })
  ])
})
</script>

<template>
  <AppLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-4 sm:p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <button
                @click="goBack"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-4"
              >
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back
              </button>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">
                  {{ eventStore.loading ? 'Loading...' : (event?.name || 'Event not found') }}
                </h1>
                <p class="text-sm text-gray-500 mt-1">
                  {{ eventStore.loading ? 'Loading event details...' : (event?.description || 'No description available') }}
                </p>
              </div>
            </div>
            <div class="flex">
              <button
                @click="createVoucher"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-2"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Create Voucher
              </button>
              <button
                @click="editEvent"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-2"
              >
                <PencilIcon class="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                @click="deleteEvent"
                class="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon class="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          v-for="stat in stats"
          :key="stat.name"
          class="bg-white overflow-hidden shadow rounded-lg"
        >
          <div class="p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <component
                  :is="stat.icon"
                  :class="[stat.color, 'h-6 w-6']"
                  aria-hidden="true"
                />
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

      <!-- Event Details -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-4 sm:p-5">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-3">Event Details</h3>

          <div v-if="eventStore.loading" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <p class="mt-2 text-sm text-gray-500">Loading event details...</p>
          </div>

          <div v-else-if="!event" class="text-center py-6">
            <h3 class="mt-2 text-sm font-medium text-gray-900">Event not found</h3>
            <p class="mt-1 text-sm text-gray-500">The event you're looking for doesn't exist.</p>
            <div v-if="eventStore.error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-600">Error: {{ eventStore.error }}</p>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">Event Name</label>
              <p class="mt-1 text-sm text-gray-900">{{ event.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <span class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ event.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Max Quantity</label>
              <p class="mt-1 text-sm text-gray-900">{{ event.maxQuantity }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Issued Count</label>
              <p class="mt-1 text-sm text-gray-900">{{ event.issuedCount }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Created At</label>
              <p class="mt-1 text-sm text-gray-900">{{ new Date(event.createdAt).toLocaleDateString() }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Updated At</label>
              <p class="mt-1 text-sm text-gray-900">{{ new Date(event.updatedAt).toLocaleDateString() }}</p>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <p class="mt-1 text-sm text-gray-900">{{ event.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vouchers List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-4 sm:p-5">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-3">Event Vouchers</h3>

          <div v-if="voucherStore.loading" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <p class="mt-2 text-sm text-gray-500">Loading vouchers...</p>
          </div>

          <div v-else-if="eventVouchers.length === 0" class="text-center py-6">
            <h3 class="mt-2 text-sm font-medium text-gray-900">No vouchers</h3>
            <p class="mt-1 text-sm text-gray-500">No vouchers have been created for this event yet.</p>
          </div>

          <div v-else class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued To
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="voucher in eventVouchers" :key="voucher.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ voucher.code }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ voucher.recipientName || voucher.issuedTo }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="voucher.isUsed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'">
                      {{ voucher.isUsed ? 'Used' : 'Unused' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ new Date(voucher.createdAt).toLocaleDateString() }}
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
