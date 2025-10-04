<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Vouchers</h1>
          <p class="mt-1 text-sm text-gray-500">
            Manage your voucher codes and campaigns
          </p>
        </div>
        <button
          @click="showIssueModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Issue Voucher
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search vouchers..."
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              v-model="statusFilter"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              v-model="typeFilter"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="applyFilters"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Vouchers Table -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div v-if="voucherStore.loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p class="mt-2 text-sm text-gray-500">Loading vouchers...</p>
          </div>

          <div v-else-if="voucherStore.vouchers.length === 0" class="text-center py-8">
            <TicketIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No vouchers found</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating a new voucher.' }}
            </p>
          </div>

          <div v-else class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Value
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Period
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="voucher in voucherStore.vouchers" :key="voucher.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ voucher.code }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ voucher.name }}</div>
                    <div class="text-sm text-gray-500">{{ voucher.description }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ voucher.type === 'percentage' ? `${voucher.value}%` : `$${voucher.value}` }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ voucher.type === 'percentage' ? 'Percentage' : 'Fixed Amount' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ voucher.usedCount }}/{{ voucher.usageLimit || '∞' }}
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        class="bg-primary-600 h-2 rounded-full"
                        :style="{ width: voucher.usageLimit ? `${(voucher.usedCount / voucher.usageLimit) * 100}%` : '0%' }"
                      ></div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{{ formatDate(voucher.startDate) }}</div>
                    <div>to {{ formatDate(voucher.endDate) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="voucher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ voucher.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button
                        @click="editVoucher(voucher)"
                        class="inline-flex items-center p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                        title="Edit voucher"
                      >
                        <PencilIcon class="h-4 w-4" />
                      </button>
                      <button
                        @click="toggleVoucherStatus(voucher.id)"
                        class="inline-flex items-center p-1.5 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-md transition-colors"
                        :title="voucher.isActive ? 'Deactivate voucher' : 'Activate voucher'"
                      >
                        <PowerIcon v-if="voucher.isActive" class="h-4 w-4" />
                        <CheckCircleIcon v-else class="h-4 w-4" />
                      </button>
                      <button
                        @click="deleteVoucher(voucher.id)"
                        class="inline-flex items-center p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete voucher"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="voucherStore.totalPages > 1" class="mt-6 flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing {{ (voucherStore.currentPage - 1) * voucherStore.limit + 1 }} to
              {{ Math.min(voucherStore.currentPage * voucherStore.limit, voucherStore.total) }} of
              {{ voucherStore.total }} results
            </div>
            <div class="flex space-x-2">
              <button
                @click="goToPage(voucherStore.currentPage - 1)"
                :disabled="voucherStore.currentPage === 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="goToPage(voucherStore.currentPage + 1)"
                :disabled="voucherStore.currentPage === voucherStore.totalPages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <!-- Issue Voucher Modal -->
    <IssueVoucherModal
      :is-open="showIssueModal"
      @close="closeIssueModal"
      @issued="handleVoucherIssued"
    />

    <VoucherModal
      v-if="showCreateModal || showEditModal"
      :voucher="editingVoucher"
      :is-edit="showEditModal"
      @close="closeModal"
      @save="handleSave"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useVoucherStore } from '@/stores/voucher'
import type { Voucher } from '@/services/voucher'
import AppLayout from '@/components/layout/AppLayout.vue'
import VoucherModal from '@/components/VoucherModal.vue'
import IssueVoucherModal from '@/components/IssueVoucherModal.vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TicketIcon,
  PowerIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

// Stores
const voucherStore = useVoucherStore()

// State
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const showCreateModal = ref(false)
const showIssueModal = ref(false)
const showEditModal = ref(false)
const editingVoucher = ref<Voucher | null>(null)

// Methods
const applyFilters = async () => {
  await voucherStore.fetchVouchers({
    search: searchQuery.value || undefined,
    isActive: statusFilter.value ? statusFilter.value === 'true' : undefined,
    // Note: type filter would need backend support
  })
}

const editVoucher = (voucher: Voucher) => {
  editingVoucher.value = voucher
  showEditModal.value = true
}

const toggleVoucherStatus = async (id: string) => {
  try {
    await voucherStore.toggleVoucherStatus(id)
  } catch (error) {
    console.error('Error toggling voucher status:', error)
  }
}

const deleteVoucher = async (id: string) => {
  if (confirm('Are you sure you want to delete this voucher?')) {
    try {
      await voucherStore.deleteVoucher(id)
    } catch (error) {
      console.error('Error deleting voucher:', error)
    }
  }
}

const goToPage = async (page: number) => {
  await voucherStore.fetchVouchers({ page })
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingVoucher.value = null
}

const handleSave = async () => {
  closeModal()
  await applyFilters()
}

// Issue Voucher Modal methods
const closeIssueModal = () => {
  showIssueModal.value = false
}

const handleVoucherIssued = async () => {
  // Refresh vouchers list to show new voucher
  await applyFilters()
  closeIssueModal()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Watch for filter changes
watch([searchQuery, statusFilter, typeFilter], () => {
  // Debounce search
  const timeoutId = setTimeout(() => {
    applyFilters()
  }, 500)

  return () => clearTimeout(timeoutId)
})

// Lifecycle
onMounted(async () => {
  await applyFilters()
})
</script>
