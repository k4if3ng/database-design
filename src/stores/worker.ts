// src/stores/worker.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { workerService } from '@/services/worker'
import type { RepairOrder } from '@/types'

export const useWorkerStore = defineStore('worker', () => {
  const assignedOrders = ref<RepairOrder[]>([])
  const processedOrders = ref<RepairOrder[]>([])
  const pendingStats = ref<any>(null)
  const earnings = ref<number>(0)
  const detailedEarnings = ref<any>(null)
  const loading = ref(false)

  const fetchAssignedOrders = async () => {
    try {
      loading.value = true
      const response = await workerService.getAssignedOrders()
      assignedOrders.value = response.data
    } catch (error) {
      console.error('Failed to fetch assigned orders:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchProcessedOrders = async () => {
    try {
      loading.value = true
      const response = await workerService.getProcessedOrders()
      processedOrders.value = response.data
    } catch (error) {
      console.error('Failed to fetch processed orders:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const acceptOrder = async (orderId: number) => {
    try {
      const response = await workerService.acceptOrder({ orderId })
      const index = assignedOrders.value.findIndex((order) => order.orderId === orderId)
      if (index !== -1) {
        assignedOrders.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Failed to accept order:', error)
      throw error
    }
  }

  const rejectOrder = async (orderId: number) => {
    try {
      const response = await workerService.rejectOrder({ orderId })
      assignedOrders.value = assignedOrders.value.filter((order) => order.orderId !== orderId)
      return response.data
    } catch (error) {
      console.error('Failed to reject order:', error)
      throw error
    }
  }

  const updateOrder = async (updateData: {
    orderId: number
    status: string
    description?: string
    repairResult?: string
    laborCost?: number
    laborHours?: number
  }) => {
    try {
      const response = await workerService.updateOrder(updateData)
      const index = assignedOrders.value.findIndex((order) => order.orderId === updateData.orderId)
      if (index !== -1) {
        assignedOrders.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Failed to update order:', error)
      throw error
    }
  }

  const fetchPendingStats = async () => {
    try {
      const response = await workerService.getPendingStats()
      pendingStats.value = response.data
    } catch (error) {
      console.error('Failed to fetch pending stats:', error)
      throw error
    }
  }

  const fetchEarnings = async () => {
    try {
      const response = await workerService.getEarnings()
      earnings.value = response.data
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
      throw error
    }
  }

  const fetchDetailedEarnings = async () => {
    try {
      const response = await workerService.getDetailedEarnings()
      detailedEarnings.value = response.data
    } catch (error) {
      console.error('Failed to fetch detailed earnings:', error)
      throw error
    }
  }

  return {
    assignedOrders,
    processedOrders,
    pendingStats,
    earnings,
    detailedEarnings,
    loading,
    fetchAssignedOrders,
    fetchProcessedOrders,
    acceptOrder,
    rejectOrder,
    updateOrder,
    fetchPendingStats,
    fetchEarnings,
    fetchDetailedEarnings,
  }
})
