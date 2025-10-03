import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Event, CreateEventRequest, UpdateEventRequest } from '@/services/event'
import { eventService } from '@/services/event'

export const useEventStore = defineStore('event', () => {
  // State
  const events = ref<Event[]>([])
  const currentEvent = ref<Event | null>(null)
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
  const activeEvents = computed(() => {
    if (!events.value || !Array.isArray(events.value)) return []
    return events.value.filter((event) => event.isActive)
  })

  const inactiveEvents = computed(() => {
    if (!events.value || !Array.isArray(events.value)) return []
    return events.value.filter((event) => !event.isActive)
  })

  const eventsWithAvailableSlots = computed(() => {
    if (!events.value || !Array.isArray(events.value)) return []
    return events.value.filter((event) => event.issuedCount < event.maxQuantity)
  })

  const totalPages = computed(() => {
    // Use meta.totalPages if available, otherwise calculate
    return meta.value.totalPages || Math.ceil(total.value / limit.value)
  })

  // Actions
  const fetchEvents = async (params?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
  }) => {
    try {
      loading.value = true
      error.value = null

      const response = await eventService.getEvents({
        page: params?.page || currentPage.value,
        limit: params?.limit || limit.value,
        search: params?.search,
        isActive: params?.isActive,
      })

      console.log('Fetched events response:', response)

      // Defensive programming - ensure we have valid data
      events.value = response?.data || []
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
      error.value = err.message || 'Failed to fetch events'
      console.error('Error fetching events:', err)
      // Ensure events is always an array even on error
      events.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchEvent = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const event = await eventService.getEvent(id)
      currentEvent.value = event
      return event
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch event'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createEvent = async (data: CreateEventRequest) => {
    try {
      loading.value = true
      error.value = null

      const newEvent = await eventService.createEvent(data)
      events.value.unshift(newEvent)
      total.value += 1
      return newEvent
    } catch (err: any) {
      error.value = err.message || 'Failed to create event'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEvent = async (id: string, data: UpdateEventRequest) => {
    try {
      loading.value = true
      error.value = null

      console.log('🔄 EventStore: Updating event with ID:', id)
      console.log('📝 EventStore: Update data:', data)

      const updatedEvent = await eventService.updateEvent(id, data)

      // Update in events array
      const index = events.value.findIndex((e) => e.id === id)
      console.log('🔍 EventStore: Found event at index:', index)
      if (index !== -1) {
        console.log('✅ EventStore: Updating event in array at index:', index)
        events.value[index] = updatedEvent
        console.log('📋 EventStore: Updated events array:', events.value)
      } else {
        console.warn('⚠️ EventStore: Event not found in array for update')
      }

      // Update current event if it's the same
      if (currentEvent.value?.id === id) {
        console.log('✅ EventStore: Updating current event')
        currentEvent.value = updatedEvent
      }

      return updatedEvent
    } catch (err: any) {
      error.value = err.message || 'Failed to update event'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      await eventService.deleteEvent(id)

      // Remove from events array
      events.value = events.value.filter((e) => e.id !== id)
      total.value -= 1

      // Clear current event if it's the same
      if (currentEvent.value?.id === id) {
        currentEvent.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete event'
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleEventStatus = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const updatedEvent = await eventService.toggleEventStatus(id)

      // Update in events array
      const index = events.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        events.value[index] = updatedEvent
      }

      // Update current event if it's the same
      if (currentEvent.value?.id === id) {
        currentEvent.value = updatedEvent
      }

      return updatedEvent
    } catch (err: any) {
      error.value = err.message || 'Failed to toggle event status'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentEvent = () => {
    currentEvent.value = null
  }

  return {
    // State
    events,
    currentEvent,
    loading,
    error,
    total,
    currentPage,
    limit,
    meta,

    // Getters
    activeEvents,
    inactiveEvents,
    eventsWithAvailableSlots,
    totalPages,

    // Actions
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    clearError,
    clearCurrentEvent,
  }
})
