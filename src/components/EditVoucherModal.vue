<template>
  <div v-if="isOpen" class="fixed inset-0 z-[9999] overflow-y-auto">
    <div
      class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="closeModal"
      ></div>
      <!-- Modal panel -->
      <div
  class="relative z-10 inline-block align-bottom bg-white rounded-lg text-left
         overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle
         sm:max-w-2xl sm:w-full"
  @click.stop
>
        <form @submit.prevent="confirmEdit">
          <!-- Header -->
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Edit Voucher</h3>
              <button
                type="button"
                @click="closeModal"
                class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>

            <!-- Voucher Info Display -->
            <div v-if="voucher" class="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Voucher Information</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Code:</span>
                  <span class="ml-2 font-mono font-medium">{{ voucher.code }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Event:</span>
                  <span class="ml-2">{{ voucher.event.name }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Issued To:</span>
                  <span class="ml-2">{{ voucher.issuedTo }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Status:</span>
                  <span class="ml-2" :class="voucher.isUsed ? 'text-red-600' : 'text-green-600'">
                    {{ voucher.isUsed ? 'Used' : 'Available' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Form Fields -->
            <div class="space-y-6">
              <!-- Recipient Information -->
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-3">Recipient Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="recipient-name" class="block text-sm font-medium text-gray-700 mb-1"
                      >Recipient Name</label
                    >
                    <input
                      id="recipient-name"
                      v-model="form.recipientName"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter recipient name"
                    />
                  </div>
                  <div>
                    <label for="phone-number" class="block text-sm font-medium text-gray-700 mb-1"
                      >Phone Number</label
                    >
                    <input
                      id="phone-number"
                      v-model="form.phoneNumber"
                      type="tel"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              <!-- Voucher Configuration -->
              <div class="border-t pt-4">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Voucher Configuration</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="voucher-type" class="block text-sm font-medium text-gray-700 mb-1"
                      >Voucher Type</label
                    >
                    <select
                      id="voucher-type"
                      v-model="form.type"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>
                  <div>
                    <label for="voucher-value" class="block text-sm font-medium text-gray-700 mb-1"
                      >Value</label
                    >
                    <div class="relative">
                      <input
                        id="voucher-value"
                        v-model.number="form.value"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        :placeholder="
                          form.type === 'percentage' ? 'Enter percentage' : 'Enter amount'
                        "
                      />
                      <div
                        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                      >
                        <span class="text-gray-500 sm:text-sm">{{
                          form.type === 'percentage' ? '%' : '$'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-4">
                  <div>
                    <label for="usage-limit" class="block text-sm font-medium text-gray-700 mb-1"
                      >Usage Limit</label
                    >
                    <input
                      id="usage-limit"
                      v-model.number="form.usageLimit"
                      type="number"
                      min="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Number of uses"
                    />
                  </div>
                </div>

                <!-- Advanced Settings for Percentage Type -->
                <div v-if="form.type === 'percentage'" class="mt-4">
                  <h5 class="text-sm font-medium text-gray-700 mb-3">Advanced Settings</h5>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        for="minimum-order"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Minimum Order Amount</label
                      >
                      <div class="relative">
                        <input
                          id="minimum-order"
                          v-model.number="form.minimumOrderAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Minimum order amount"
                        />
                        <div
                          class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                        >
                          <span class="text-gray-500 sm:text-sm">$</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label
                        for="maximum-discount"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Maximum Discount</label
                      >
                      <div class="relative">
                        <input
                          id="maximum-discount"
                          v-model.number="form.maximumDiscount"
                          type="number"
                          min="0"
                          step="0.01"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Maximum discount amount"
                        />
                        <div
                          class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                        >
                          <span class="text-gray-500 sm:text-sm">$</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Validity Period -->
              <div class="border-t pt-4">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Validity Period</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="valid-from" class="block text-sm font-medium text-gray-700 mb-1"
                      >Valid From</label
                    >
                    <VueDatePicker
                      v-model="form.validFrom"
                      :enable-time-picker="false"
                      :format="'yyyy-MM-dd'"
                      :placeholder="'Select start date'"
                      :clearable="true"
                      class="w-full dp-custom"
                    />
                  </div>
                  <div>
                    <label for="valid-to" class="block text-sm font-medium text-gray-700 mb-1"
                      >Valid To</label
                    >
                    <VueDatePicker
                      v-model="form.validTo"
                      :enable-time-picker="false"
                      :format="'yyyy-MM-dd'"
                      :placeholder="'Select end date'"
                      :clearable="true"
                      class="w-full dp-custom"
                    />
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div class="border-t pt-4">
                <label for="notes" class="block text-sm font-medium text-gray-700 mb-1"
                  >Notes</label
                >
                <textarea
                  id="notes"
                  v-model="form.notes"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Additional notes about this voucher"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                v-if="loading"
                class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
              ></span>
              {{ loading ? 'Updating...' : 'Update Voucher' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useVoucherStore } from '@/stores/voucher'
import type { Voucher } from '@/services/voucher'

// Props
interface Props {
  isOpen: boolean
  voucher: Voucher | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  updated: [voucher: Voucher]
}>()

// Stores
const voucherStore = useVoucherStore()

// State
const loading = ref(false)

// Form data
const form = reactive({
  recipientName: '',
  phoneNumber: '',
  type: 'fixed' as 'percentage' | 'fixed',
  value: 10,
  usageLimit: 1,
  minimumOrderAmount: 0,
  maximumDiscount: 0,
  validFrom: null as Date | null,
  validTo: null as Date | null,
  notes: '',
})

// Methods
const resetForm = () => {
  form.recipientName = ''
  form.phoneNumber = ''
  form.type = 'fixed'
  form.value = 10
  form.usageLimit = 1
  form.minimumOrderAmount = 0
  form.maximumDiscount = 0
  form.validFrom = null
  form.validTo = null
  form.notes = ''
}

const populateForm = () => {
  if (!props.voucher) return

  // Populate form with existing voucher data
  form.recipientName = props.voucher.recipientName || ''
  form.phoneNumber = props.voucher.phoneNumber || ''
  form.type = props.voucher.type || 'fixed'
  form.value = props.voucher.value || 10
  form.usageLimit = props.voucher.usageLimit || 1
  form.minimumOrderAmount = props.voucher.minimumOrderAmount || 0
  form.maximumDiscount = props.voucher.maximumDiscount || 0
  form.validFrom = props.voucher.validFrom ? new Date(props.voucher.validFrom) : null
  form.validTo = props.voucher.validTo ? new Date(props.voucher.validTo) : null
  form.notes = props.voucher.description || ''
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const confirmEdit = async () => {
  if (!props.voucher) return

  loading.value = true
  try {
    const updateData = {
      recipientName: form.recipientName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      type: form.type,
      value: form.value,
      usageLimit: form.usageLimit,
      minimumOrderAmount: form.minimumOrderAmount,
      maximumDiscount: form.maximumDiscount,
      validFrom: form.validFrom ? form.validFrom.toISOString().split('T')[0] : undefined,
      validTo: form.validTo ? form.validTo.toISOString().split('T')[0] : undefined,
      notes: form.notes.trim(),
    }

    const updatedVoucher = await voucherStore.updateVoucher(props.voucher.id, updateData)
    emit('updated', updatedVoucher)
    closeModal()
  } catch (error) {
    console.error('Error updating voucher:', error)
    // You might want to show an error message to the user here
  } finally {
    loading.value = false
  }
}

// Watch for voucher changes to populate form
watch(
  () => props.voucher,
  (newVoucher) => {
    if (newVoucher) {
      populateForm()
    }
  },
  { immediate: true },
)

// Watch for modal open to populate form
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.voucher) {
      populateForm()
    }
  },
)
</script>

<style scoped>
/* Custom styling for VueDatePicker */
:deep(.dp-custom) {
  --dp-primary-color: #3b82f6;
  --dp-primary-text-color: #ffffff;
  --dp-primary-hover-color: #2563eb;
  --dp-border-color: #d1d5db;
  --dp-border-radius: 0.375rem;
  --dp-font-family: inherit;
  width: 100%;
}

:deep(.dp-custom .dp__input) {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: #ffffff;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
}

:deep(.dp-custom .dp__input:focus) {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.dp-custom .dp__input::placeholder) {
  color: #9ca3af;
}

:deep(.dp-custom .dp__input_icon) {
  color: #6b7280;
}

:deep(.dp-custom .dp__input_icon_pad) {
  padding-left: 2.5rem;
}

/* Fix for date picker dropdown */
:deep(.dp-custom .dp__menu) {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 9998 !important;
}

:deep(.dp-custom .dp__calendar_header) {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.dp-custom .dp__calendar_header_item) {
  color: #374151;
  font-weight: 500;
}

:deep(.dp-custom .dp__cell_inner) {
  border-radius: 0.25rem;
}

:deep(.dp-custom .dp__cell_inner:hover) {
  background-color: #f3f4f6;
}

:deep(.dp-custom .dp__cell_inner.dp__active_date) {
  background-color: #3b82f6;
  color: #ffffff;
}

:deep(.dp-custom .dp__cell_inner.dp__today) {
  background-color: #dbeafe;
  color: #1d4ed8;
  font-weight: 600;
}
</style>
