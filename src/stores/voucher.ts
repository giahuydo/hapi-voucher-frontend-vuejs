import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Voucher, CreateVoucherRequest, UpdateVoucherRequest } from '@/services/voucher'
import { voucherService } from '@/services/voucher'

export const useVoucherStore = defineStore('voucher', () => {
  // State
  const vouchers = ref<Voucher[]>([])
  const currentVoucher = ref<Voucher | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const limit = ref(10)
  const meta = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Getters
  const usedVouchers = computed(() => {
    if (!vouchers.value || !Array.isArray(vouchers.value)) return []
    return vouchers.value.filter((voucher) => voucher.isUsed)
  })

  const unusedVouchers = computed(() => {
    if (!vouchers.value || !Array.isArray(vouchers.value)) return []
    return vouchers.value.filter((voucher) => !voucher.isUsed)
  })

  const activeEventVouchers = computed(() => {
    if (!vouchers.value || !Array.isArray(vouchers.value)) return []
    return vouchers.value.filter((voucher) => voucher.event.isActive)
  })

  const totalPages = computed(() => {
    // Use meta.totalPages if available, otherwise calculate
    return meta.value.totalPages || Math.ceil(total.value / limit.value)
  })

  // Actions
  const fetchVouchers = async (params?: {
    page?: number
    limit?: number
    search?: string
    isUsed?: boolean
    eventId?: string
    type?: 'percentage' | 'fixed'
  }) => {
    try {
      loading.value = true
      error.value = null

      const response = await voucherService.getVouchers({
        page: params?.page || currentPage.value,
        limit: params?.limit || limit.value,
        search: params?.search,
        isUsed: params?.isUsed,
        eventId: params?.eventId,
        type: params?.type,
      })

        console.log('Fetched vouchers response:', response)

        // Defensive programming - ensure we have valid data
        vouchers.value = response?.data || []
        total.value = response?.meta?.total || 0
        currentPage.value = response?.meta?.page || 1
        limit.value = response?.meta?.limit || 10

        // Store full meta data
        if (response?.meta) {
          meta.value = {
            page: response.meta.page || 1,
            limit: response.meta.limit || 10,
            total: response.meta.total || 0,
            totalPages: response.meta.totalPages || 0,
            hasNext: response.meta.hasNext || false,
            hasPrev: response.meta.hasPrev || false
          }
        }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch vouchers'
      console.error('Error fetching vouchers:', err)
      // Ensure vouchers is always an array even on error
      vouchers.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchVoucher = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const voucher = await voucherService.getVoucher(id)
      currentVoucher.value = voucher
      return voucher
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch voucher'
      console.error('Error fetching voucher:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createVoucher = async (data: CreateVoucherRequest) => {
    try {
      loading.value = true
      error.value = null

      const newVoucher = await voucherService.createVoucher(data)
      vouchers.value.unshift(newVoucher)
      total.value += 1
      return newVoucher
    } catch (err: any) {
      error.value = err.message || 'Failed to create voucher'
      console.error('Error creating voucher:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateVoucher = async (id: string, data: UpdateVoucherRequest) => {
    try {
      loading.value = true
      error.value = null

      const updatedVoucher = await voucherService.updateVoucher(id, data)

      // Update in vouchers array
      const index = vouchers.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        vouchers.value[index] = updatedVoucher
      }

      // Update current voucher if it's the same
      if (currentVoucher.value?.id === id) {
        currentVoucher.value = updatedVoucher
      }

      return updatedVoucher
    } catch (err: any) {
      error.value = err.message || 'Failed to update voucher'
      console.error('Error updating voucher:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteVoucher = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      await voucherService.deleteVoucher(id)

      // Remove from vouchers array
      vouchers.value = vouchers.value.filter((v) => v.id !== id)
      total.value -= 1

      // Clear current voucher if it's the same
      if (currentVoucher.value?.id === id) {
        currentVoucher.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete voucher'
      console.error('Error deleting voucher:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleVoucherUsage = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const updatedVoucher = await voucherService.toggleVoucherUsage(id)

      // Update in vouchers array
      const index = vouchers.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        vouchers.value[index] = updatedVoucher
      }

      // Update current voucher if it's the same
      if (currentVoucher.value?.id === id) {
        currentVoucher.value = updatedVoucher
      }

      return updatedVoucher
    } catch (err: any) {
      error.value = err.message || 'Failed to toggle voucher usage'
      console.error('Error toggling voucher usage:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const validateVoucher = async (code: string, orderAmount?: number) => {
    try {
      return await voucherService.validateVoucher(code, orderAmount)
    } catch (err: any) {
      error.value = err.message || 'Failed to validate voucher'
      console.error('Error validating voucher:', err)
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentVoucher = () => {
    currentVoucher.value = null
  }

    return {
      // State
      vouchers,
      currentVoucher,
      loading,
      error,
      total,
      currentPage,
      limit,
      meta,

      // Getters
      usedVouchers,
      unusedVouchers,
      activeEventVouchers,
      totalPages,

      // Actions
      fetchVouchers,
    fetchVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    toggleVoucherUsage,
    validateVoucher,
    clearError,
    clearCurrentVoucher,
  }
})
