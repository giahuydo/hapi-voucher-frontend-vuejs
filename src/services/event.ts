import { api } from './api'

// Types
export interface Event {
  id: string
  name: string
  description: string
  maxQuantity: number
  issuedCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  editingBy?: string
  editLockAt?: string
}

export interface CreateEventRequest {
  name: string
  description: string
  maxQuantity: number
  isActive?: boolean
}

export interface UpdateEventRequest {
  name?: string
  description?: string
  maxQuantity?: number
  isActive?: boolean
}

export interface EventListResponse {
  data: Event[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Event API Services
export const eventService = {
  // Get all events with pagination
  getEvents: async (params?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
  }): Promise<EventListResponse> => {
    const response = await api.get<EventListResponse>('/events', { params })
    return response.data
  },

  // Get event by ID
  getEvent: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`)
    return response.data
  },

  // Create new event
  createEvent: async (data: CreateEventRequest): Promise<Event> => {
    const response = await api.post<Event>('/events', data)
    return response.data
  },

  // Update event
  updateEvent: async (id: string, data: UpdateEventRequest): Promise<Event> => {
    console.log('🔄 EventService: Updating event with ID:', id)
    console.log('📝 EventService: Update data:', data)
    console.log('🌐 EventService: API URL:', `/events/${id}`)

    const response = await api.put<Event>(`/events/${id}`, data)
    console.log('✅ EventService: Update response:', response.data)
    return response.data
  },

  // Delete event
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`)
  },

  // Toggle event status
  toggleEventStatus: async (id: string): Promise<Event> => {
    const response = await api.patch<Event>(`/events/${id}/toggle`)
    return response.data
  },

  // Get event statistics
  getEventStats: async (): Promise<{
    totalEvents: number
    activeEvents: number
    inactiveEvents: number
    totalIssued: number
    totalAvailable: number
  }> => {
    const response = await api.get('/events/stats')
    return response.data
  },

  // Request edit access for an event
  requestEditAccess: async (eventId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.post(`/events/${eventId}/editable/me`)
      return { success: true, message: 'Edit access granted' }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 409) {
        return { success: false, message: 'Event is currently being edited by another user' }
      }
      throw error
    }
  },

  // Release edit access for an event
  releaseEditAccess: async (eventId: string): Promise<void> => {
    await api.post(`/events/${eventId}/editable/release`)
  },

  // Maintain edit access (extend timeout)
  maintainEditAccess: async (eventId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.post(`/events/${eventId}/editable/maintain`)
      return { success: true }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 409) {
        return { success: false, message: 'Edit access has expired' }
      }
      throw error
    }
  }
}
