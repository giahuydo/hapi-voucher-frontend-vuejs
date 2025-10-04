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

  // Editing lock state
  const editingEvents = ref<Set<string>>(new Set())
  const editLockIntervals = ref<Map<string, number>>(new Map())

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
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      error.value = errorObj.message || 'Failed to fetch events'
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
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      error.value = errorObj.message || 'Failed to fetch event'
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
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      error.value = errorObj.message || 'Failed to create event'
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
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      error.value = errorObj.message || 'Failed to update event'
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
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      error.value = errorObj.message || 'Failed to delete event'
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
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      error.value = errorObj.message || 'Failed to toggle event status'
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

  // Editing lock actions
  const requestEditAccess = async (eventId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await eventService.requestEditAccess(eventId)
      if (result.success) {
        editingEvents.value.add(eventId)
        startMaintainEditLock(eventId)
      }
      return result
    } catch (error: unknown) {
      const err = error as { message?: string }
      return { success: false, message: err.message || 'Failed to request edit access' }
    }
  }

  const releaseEditAccess = async (eventId: string): Promise<void> => {
    try {
      await eventService.releaseEditAccess(eventId)
      editingEvents.value.delete(eventId)
      stopMaintainEditLock(eventId)
    } catch (error) {
      console.error('Error releasing edit access:', error)
    }
  }

  const startMaintainEditLock = (eventId: string): void => {
    // Clear existing interval if any
    stopMaintainEditLock(eventId)

    // Start new interval to maintain edit lock every 4 minutes (before 5-minute timeout)
    const interval = setInterval(async () => {
      try {
        const result = await eventService.maintainEditAccess(eventId)
        if (!result.success) {
          // Edit access expired, remove from editing set
          editingEvents.value.delete(eventId)
          stopMaintainEditLock(eventId)
        }
      } catch (error) {
        console.error('Error maintaining edit access:', error)
        editingEvents.value.delete(eventId)
        stopMaintainEditLock(eventId)
      }
    }, 4 * 60 * 1000) // 4 minutes

    editLockIntervals.value.set(eventId, interval)
  }

  const stopMaintainEditLock = (eventId: string): void => {
    const interval = editLockIntervals.value.get(eventId)
    if (interval) {
      clearInterval(interval)
      editLockIntervals.value.delete(eventId)
    }
  }

  const isEventBeingEdited = (eventId: string): boolean => {
    return editingEvents.value.has(eventId)
  }

  const isEventLockedByOthers = (event: Event): boolean => {
    return !!(event.editingBy && event.editingBy !== 'current-user') // TODO: Replace with actual current user ID
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
    editingEvents,

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

    // Editing lock actions
    requestEditAccess,
    releaseEditAccess,
    isEventBeingEdited,
    isEventLockedByOthers,
  }
})
