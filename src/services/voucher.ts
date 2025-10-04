import { api } from './api'

// Types
export interface Voucher {
  id: string
  eventId: string
  code: string
  issuedTo: string
  isUsed: boolean
  createdAt: string
  updatedAt: string
  // Voucher specific fields
  name?: string
  description?: string
  type?: 'percentage' | 'fixed'
  value?: number
  usedCount?: number
  usageLimit?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
  event: {
    id: string
    name: string
    description: string
    maxQuantity: number
    issuedCount: number
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
}

export interface CreateVoucherRequest {
  eventId: string
  issueTo: string
  recipientName?: string
  phoneNumber?: string
  type?: 'percentage' | 'fixed'
  value?: number
  usageLimit?: number
  expiryDate?: string
  minimumOrderAmount?: number
  maximumDiscount?: number
  validFrom?: string
  validTo?: string
  notes?: string
}

export interface UpdateVoucherRequest {
  isUsed?: boolean
  recipientName?: string
  phoneNumber?: string
  type?: 'percentage' | 'fixed'
  value?: number
  usageLimit?: number
  expiryDate?: string
  minimumOrderAmount?: number
  maximumDiscount?: number
  validFrom?: string
  validTo?: string
  notes?: string
}

export interface VoucherListResponse {
  data: Voucher[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Voucher API Services
export const voucherService = {
  // Get all vouchers with pagination
  getVouchers: async (params?: {
    page?: number
    limit?: number
    search?: string
    isUsed?: boolean
    eventId?: string
  }): Promise<VoucherListResponse> => {
    const response = await api.get<VoucherListResponse>('/vouchers', { params })
    return response.data
  },

  // Get voucher by ID
  getVoucher: async (id: string): Promise<Voucher> => {
    const response = await api.get<Voucher>(`/vouchers/${id}`)
    return response.data
  },

  // Create new voucher (issue voucher to user)
  createVoucher: async (data: CreateVoucherRequest): Promise<Voucher> => {
    console.log('🔄 VoucherService: Creating voucher with data:', data)
    const response = await api.post<Voucher>('/vouchers/issue', data)
    console.log('✅ VoucherService: Voucher created:', response.data)
    return response.data
  },

  // Update voucher (mark as used/unused)
  updateVoucher: async (id: string, data: UpdateVoucherRequest): Promise<Voucher> => {
    const response = await api.put<Voucher>(`/vouchers/${id}`, data)
    return response.data
  },

  // Delete voucher
  deleteVoucher: async (id: string): Promise<void> => {
    await api.delete(`/vouchers/${id}`)
  },

  // Toggle voucher usage status
  toggleVoucherUsage: async (id: string): Promise<Voucher> => {
    const response = await api.patch<Voucher>(`/vouchers/${id}/toggle-usage`)
    return response.data
  },

  // Validate voucher code
  validateVoucher: async (
    code: string,
    orderAmount?: number,
  ): Promise<{
    isValid: boolean
    voucher?: Voucher
    message?: string
  }> => {
    const response = await api.post('/vouchers/validate', { code, orderAmount })
    return response.data
  },
}
