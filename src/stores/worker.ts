import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { workerService } from '@/services/worker'
import type { WorkerEarning, RepairLog, RepairOrder, WorkerPerformance, MonthlySettlement } from '@/types'

export const useWorkerStore = defineStore('worker', () => {
  const assignedOrders = ref<RepairOrder[]>([])
  const repairOrders = ref<RepairOrder[]>([])
  const earnings = ref<number | null>(null)
  const earningDetails = ref<WorkerEarning | null>(null)
  const workerPerformance = ref<WorkerPerformance | null>(null)
  const settlementRecords = ref<MonthlySettlement[]>([])
  const loading = ref(false)

  // 计算属性：格式化收入数据用于 Performance 页面
  const performanceEarnings = computed(() => {
    if (!earnings.value || !workerPerformance.value) return null
    
    return {
      totalEarnings: workerPerformance.value.totalEarnings,
      thisMonthEarnings: getCurrentMonthEarnings(),
      completedOrders: workerPerformance.value.completedOrders,
      averageOrderValue: workerPerformance.value.completedOrders > 0 
        ? workerPerformance.value.totalEarnings / workerPerformance.value.completedOrders 
        : 0
    }
  })

  const getCurrentMonthEarnings = (): number => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    const monthlyRecord = settlementRecords.value.find(record => 
      record.settlementMonth === currentMonth && record.settlementYear === currentYear
    )
    
    return monthlyRecord?.totalSalary || 0
  }

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

  const fetchRepairOrders = async () => {
    try {
      loading.value = true
      const response = await workerService.getRepairOrders()
      repairOrders.value = response.data
    } catch (error) {
      console.error('Failed to fetch repair orders:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const acceptOrder = async (orderId: number) => {
    loading.value = true
    try {
      const response = await workerService.acceptOrder(orderId)
      
      const index = assignedOrders.value.findIndex(order => order.orderId === orderId)
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
      
      const index = assignedOrders.value.findIndex(order => order.orderId === orderId)
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
      
      const index = assignedOrders.value.findIndex(order => order.orderId === orderId)
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

  const fetchEarningDetails = async () => {
    try {
      const response = await workerService.getEarningDetails()
      earningDetails.value = response.data
    } catch (error) {
      console.error('Failed to fetch earning details:', error)
      throw error
    }
  }

  const fetchWorkerPerformance = async () => {
    try {
      const response = await workerService.getWorkerPerformance()
      workerPerformance.value = response.data
    } catch (error) {
      console.error('Failed to fetch worker performance:', error)
      throw error
    }
  }

  const fetchSettlementRecords = async () => {
    try {
      const response = await workerService.getSettlementRecords()
      settlementRecords.value = response.data
    } catch (error) {
      console.error('Failed to fetch settlement records:', error)
      throw error
    }
  }

  return {
    assignedOrders,
    repairOrders,
    earnings,
    earningDetails,
    workerPerformance,
    settlementRecords,
    performanceEarnings,
    loading,
    fetchAssignedOrders,
    fetchRepairOrders,
    acceptOrder,
    rejectOrder,
    completeOrder,
    addMaterial,
    fetchEarnings,
    fetchEarningDetails,
    fetchWorkerPerformance,
    fetchSettlementRecords
  }
})