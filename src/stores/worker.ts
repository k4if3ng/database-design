import { defineStore } from 'pinia'
import { ref } from 'vue'
import { workerService } from '@/services/worker'
import type { Earning, RepairLog, RepairOrder, Performance } from '@/types'

export const useWorkerStore = defineStore('worker', () => {
  const assignedOrders = ref<RepairOrder[]>([])
  const repairLogs = ref<RepairLog[]>([])
  const earnings = ref<Earning | null>(null)
  const performance = ref<Performance | null>(null)
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

  const fetchRepairLogs = async () => {
    try {
      loading.value = true
      const response = await workerService.getRepairLogs()
      repairLogs.value = response.data
    } catch (error) {
      console.error('Failed to fetch repair logs:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const acceptOrder = async (orderId: number) => {
    loading.value = true
    try {
      const response = await workerService.acceptOrder(orderId)
      
      const index = assignedOrders.value.findIndex(order => order.id === orderId)
      if (index !== -1) {
        assignedOrders.value[index].status = 'ACCEPTED'
      }
      
      await fetchAssignedOrders()
      
      return response
    } catch (error) {
      console.error('Failed to accept order:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const rejectOrder = async (orderId: number, reason: string) => {
    if (!reason || reason.trim() === '') {
      throw new Error('拒绝原因不能为空')
    }
    
    loading.value = true
    try {
      const response = await workerService.rejectOrder(orderId, { reason })
      
      const index = assignedOrders.value.findIndex(order => order.id === orderId)
      if (index !== -1) {
        assignedOrders.value[index].status = 'REJECTED'
      }
      
      await fetchAssignedOrders()
      
      return response
    } catch (error) {
      console.error('Failed to reject order:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const completeOrder = async (orderId: number, data: {
    laborHours: number
    description: string
    suggestion: string
  }) => {
    loading.value = true
    try {
      const response = await workerService.completeOrder(orderId, data)
      
      const index = assignedOrders.value.findIndex(order => order.id === orderId)
      if (index !== -1) {
        assignedOrders.value[index].status = 'COMPLETED'
      }
      
      await fetchAssignedOrders()
      
      return response
    } catch (error) {
      console.error('Failed to complete order:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const addMaterial = async (orderId: number, data: {
    name: string
    quantity: number
    unitPrice: number
    supplier: string
  }) => {
    try {
      const response = await workerService.addMaterial(orderId, data)
      return response
    } catch (error) {
      console.error('Failed to add material:', error)
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

  const fetchPerformance = async () => {
    try {
      const response = await workerService.getPerformance()
      performance.value = response.data
    } catch (error) {
      console.error('Failed to fetch performance:', error)
      throw error
    }
  }

  return {
    assignedOrders,
    repairLogs,
    earnings,
    performance,
    loading,
    fetchAssignedOrders,
    fetchRepairLogs,
    acceptOrder,
    rejectOrder,
    completeOrder,
    addMaterial,
    fetchEarnings,
    fetchPerformance
  }
})
