<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useVoucherStore } from '@/stores/voucher'
import { useEventStore } from '@/stores/event'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import {
  TicketIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

// Stores
const voucherStore = useVoucherStore()
const eventStore = useEventStore()
const authStore = useAuthStore()

// Computed
const stats = computed(() => [
  {
    name: 'Total Vouchers',
    value: voucherStore.total,
    icon: TicketIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'Used Vouchers',
    value: voucherStore.usedVouchers.length,
    icon: ChartBarIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    name: 'Unused Vouchers',
    value: voucherStore.unusedVouchers.length,
    icon: UsersIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    name: 'Active Events',
    value: eventStore.activeEvents.length,
    icon: CurrencyDollarIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    name: 'Total Events',
    value: eventStore.total,
    icon: TicketIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  }
])

// Lifecycle
onMounted(async () => {
  await Promise.all([
    voucherStore.fetchVouchers({ limit: 5 }),
    eventStore.fetchEvents({ limit: 5 })
  ])
})
</script>

<template>
  <AppLayout>
    <div class="space-y-4">
      <!-- Welcome Section -->
      <div class="bg-white rounded-lg shadow p-4">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {{ authStore.user?.name }}!
        </h1>
        <p class="text-gray-600">
          Here's what's happening with your voucher system today.
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.name"
          class="bg-white overflow-hidden shadow rounded-lg"
        >
          <div class="p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div :class="[stat.bgColor, 'p-3 rounded-md']">
                  <component :is="stat.icon" :class="[stat.color, 'h-6 w-6']" />
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

      <!-- Recent Vouchers -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-4 sm:p-5">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-3">
            Recent Vouchers
          </h3>

          <div v-if="voucherStore.loading" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>

          <div v-else-if="voucherStore.vouchers.length === 0" class="text-center py-8">
            <TicketIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No vouchers</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating a new voucher.</p>
          </div>

          <div v-else class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued To
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Usage
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="voucher in voucherStore.vouchers" :key="voucher.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ voucher.code }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <router-link
                      :to="`/events/${voucher.event.id}`"
                      class="text-primary-600 hover:text-primary-900 font-medium hover:underline"
                    >
                      {{ voucher.event.name }}
                    </router-link>
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
                    {{ voucher.event.issuedCount }}/{{ voucher.event.maxQuantity }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Events Section -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-4 sm:p-5">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-3">Recent Events</h3>

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
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
