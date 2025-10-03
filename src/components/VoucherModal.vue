<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="$emit('close')"></div>
      </div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {{ isEdit ? 'Edit Voucher' : 'Create New Voucher' }}
                </h3>

                <div class="space-y-4">
                  <!-- Code -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Voucher Code *
                    </label>
                    <input
                      v-model="form.code"
                      type="text"
                      required
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="e.g., SAVE20"
                    />
                  </div>

                  <!-- Name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      v-model="form.name"
                      type="text"
                      required
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="e.g., 20% Off Summer Sale"
                    />
                  </div>

                  <!-- Description -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      v-model="form.description"
                      rows="3"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Describe this voucher..."
                    ></textarea>
                  </div>

                  <!-- Type and Value -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        v-model="form.type"
                        required
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Value *
                      </label>
                      <div class="relative">
                        <input
                          v-model.number="form.value"
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          :placeholder="form.type === 'percentage' ? '20' : '10.00'"
                        />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span class="text-gray-500 sm:text-sm">
                            {{ form.type === 'percentage' ? '%' : '$' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Min Order Amount -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order Amount
                    </label>
                    <input
                      v-model.number="form.minOrderAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <!-- Max Discount Amount (for percentage) -->
                  <div v-if="form.type === 'percentage'">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Discount Amount
                    </label>
                    <input
                      v-model.number="form.maxDiscountAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <!-- Usage Limit -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Usage Limit
                    </label>
                    <input
                      v-model.number="form.usageLimit"
                      type="number"
                      min="1"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <!-- Date Range -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        v-model="form.startDate"
                        type="datetime-local"
                        required
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        v-model="form.endDate"
                        type="datetime-local"
                        required
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <!-- Active Status (for edit mode) -->
                  <div v-if="isEdit" class="flex items-center">
                    <input
                      v-model="form.isActive"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label class="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
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
import { ref, reactive, watch, onMounted } from 'vue'
import { useVoucherStore } from '@/stores/voucher'
import type { Voucher, CreateVoucherRequest, UpdateVoucherRequest } from '@/services/voucher'

// Props
interface Props {
  voucher?: Voucher | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  voucher: null,
  isEdit: false
})

// Emits
const emit = defineEmits<{
  close: []
  save: []
}>()

// Stores
const voucherStore = useVoucherStore()

// State
const loading = ref(false)
const form = reactive<CreateVoucherRequest & { isActive?: boolean }>({
  code: '',
  name: '',
  description: '',
  type: 'percentage',
  value: 0,
  minOrderAmount: undefined,
  maxDiscountAmount: undefined,
  startDate: '',
  endDate: '',
  usageLimit: undefined,
  isActive: true
})

// Methods
const resetForm = () => {
  Object.assign(form, {
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    minOrderAmount: undefined,
    maxDiscountAmount: undefined,
    startDate: '',
    endDate: '',
    usageLimit: undefined,
    isActive: true
  })
}

const populateForm = (voucher: Voucher) => {
  Object.assign(form, {
    code: voucher.code,
    name: voucher.name,
    description: voucher.description,
    type: voucher.type,
    value: voucher.value,
    minOrderAmount: voucher.minOrderAmount,
    maxDiscountAmount: voucher.maxDiscountAmount,
    startDate: new Date(voucher.startDate).toISOString().slice(0, 16),
    endDate: new Date(voucher.endDate).toISOString().slice(0, 16),
    usageLimit: voucher.usageLimit,
    isActive: voucher.isActive
  })
}

const handleSubmit = async () => {
  try {
    loading.value = true

    const formData = {
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      minOrderAmount: form.minOrderAmount || undefined,
      maxDiscountAmount: form.maxDiscountAmount || undefined,
      usageLimit: form.usageLimit || undefined
    }

    if (props.isEdit && props.voucher) {
      await voucherStore.updateVoucher(props.voucher.id, formData as UpdateVoucherRequest)
    } else {
      await voucherStore.createVoucher(formData as CreateVoucherRequest)
    }

    emit('save')
  } catch (error) {
    console.error('Error saving voucher:', error)
  } finally {
    loading.value = false
  }
}

// Watch for voucher prop changes
watch(() => props.voucher, (newVoucher) => {
  if (newVoucher && props.isEdit) {
    populateForm(newVoucher)
  } else {
    resetForm()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  if (props.voucher && props.isEdit) {
    populateForm(props.voucher)
  } else {
    // Set default dates for new voucher
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    
    form.startDate = now.toISOString().slice(0, 16)
    form.endDate = nextMonth.toISOString().slice(0, 16)
  }
})
</script>
