<template>
  <AppLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Analytics</h1>
        <p class="mt-1 text-sm text-gray-500">
          Track voucher performance and usage statistics
        </p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="p-3 rounded-md bg-blue-100">
                  <ChartBarIcon class="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Redemptions
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ totalRedemptions }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="p-3 rounded-md bg-green-100">
                  <CurrencyDollarIcon class="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Discount Given
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    ${{ totalDiscount.toFixed(2) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="p-3 rounded-md bg-purple-100">
                  <TicketIcon class="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Most Used Voucher
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ mostUsedVoucher?.code || 'N/A' }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="p-3 rounded-md bg-yellow-100">
                  <UsersIcon class="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Conversion Rate
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ conversionRate.toFixed(1) }}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Usage Over Time -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Voucher Usage Over Time
          </h3>
          <div class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <ChartBarIcon class="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p>Chart will be implemented with a charting library</p>
            </div>
          </div>
        </div>

        <!-- Top Vouchers -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Top Performing Vouchers
          </h3>
          <div class="space-y-3">
            <div
              v-for="(voucher, index) in topVouchers"
              :key="voucher.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-primary-600">{{ index + 1 }}</span>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ voucher.code }}</p>
                  <p class="text-sm text-gray-500">{{ voucher.name }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">{{ voucher.usedCount }} uses</p>
                <p class="text-sm text-gray-500">
                  {{ voucher.type === 'percentage' ? `${voucher.value}%` : `$${voucher.value}` }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Voucher Activity
          </h3>
          <div class="text-center py-8">
            <ClockIcon class="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <h3 class="text-sm font-medium text-gray-900">No recent activity</h3>
            <p class="mt-1 text-sm text-gray-500">
              Voucher usage activity will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useVoucherStore } from '@/stores/voucher'
import AppLayout from '@/components/layout/AppLayout.vue'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  TicketIcon,
  UsersIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

// Stores
const voucherStore = useVoucherStore()

// Computed
const totalRedemptions = computed(() =>
  voucherStore.vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0)
)

const totalDiscount = computed(() => {
  return voucherStore.vouchers.reduce((sum, v) => {
    // This is a simplified calculation
    // In a real app, you'd track actual discount amounts
    const avgOrderValue = 50 // Assume average order value
    const discountPerUse = v.type === 'percentage'
      ? (avgOrderValue * (v.value || 0) / 100)
      : (v.value || 0)
    return sum + (discountPerUse * (v.usedCount || 0))
  }, 0)
})

const mostUsedVoucher = computed(() => {
  if (voucherStore.vouchers.length === 0) return null
  return voucherStore.vouchers.reduce((max, v) =>
    (v.usedCount || 0) > (max.usedCount || 0) ? v : max
  )
})

const topVouchers = computed(() => {
  return [...voucherStore.vouchers]
    .sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0))
    .slice(0, 5)
})

const conversionRate = computed(() => {
  const totalVouchers = voucherStore.vouchers.length
  const usedVouchers = voucherStore.vouchers.filter(v => (v.usedCount || 0) > 0).length
  return totalVouchers > 0 ? (usedVouchers / totalVouchers) * 100 : 0
})

// Lifecycle
onMounted(async () => {
  await voucherStore.fetchVouchers()
})
</script>
