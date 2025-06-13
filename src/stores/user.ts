// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/user'
import type { Vehicle, RepairOrder, RepairLog, SubmitRepairRequest } from '@/types'

export const useUserStore = defineStore('user', () => {
  const vehicles = ref<Vehicle[]>([])
  const repairOrders = ref<RepairOrder[]>([])
  const repairLogs = ref<RepairLog[]>([])
  const loading = ref(false)

  const fetchVehicles = async () => {
    try {
      loading.value = true
      const response = await userService.getVehicles()
      vehicles.value = response.data
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const addVehicle = async (vehicleData: Omit<Vehicle, 'vehicleId'>) => {
    try {
      const response = await userService.addVehicle(vehicleData)
      vehicles.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to add vehicle:', error)
      throw error
    }
  }

  const submitFeedback = async (feedbackData: {
    repairOrderId: number
    rating: number
    content: string
  }) => {
    try {
      const response = await userService.submitFeedback(feedbackData)
      const updatedOrder = response.data
      const index = repairOrders.value.findIndex(order => order.orderId === feedbackData.repairOrderId)
      if (index !== -1) {
        repairOrders.value[index] = updatedOrder
      }
      return updatedOrder
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      throw error
    }
  }

  const fetchRepairOrders = async () => {
    try {
      loading.value = true
      const response = await userService.getRepairOrders()
      repairOrders.value = response.data.map(order => ({
        ...order,
        hasFeedback: order.feedbackId !== undefined
      }))
    } catch (error) {
      console.error('Failed to fetch repair orders:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchRepairLogs = async () => {
    try {
      loading.value = true
      const response = await userService.getRepairLogs()
      repairLogs.value = response.data.map(log => ({
        ...log,
      }))
    } catch (error) {
      console.error('Failed to fetch repair logs:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const submitRepair = async (repairData: SubmitRepairRequest) => {
    try {
      const response = await userService.submitRepair(repairData)
      const newOrder = response.data
      repairOrders.value.push(newOrder)
      return newOrder
    } catch (error) {
      console.error('Failed to submit repair:', error)
      throw error
    }
  }

  return {
    vehicles,
    repairOrders,
    repairLogs,
    loading,
    fetchVehicles,
    addVehicle,
    fetchRepairOrders,
    fetchRepairLogs,
    submitRepair,
    submitFeedback,
  }
})
