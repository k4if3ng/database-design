import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { workerService } from '@/services/worker'
import type { WorkerEarning, RepairOrder, WorkerPerformance, MonthlySettlement, Material } from '@/types'

export const useWorkerStore = defineStore('worker', () => {
  // State
  const assignedOrders = ref<RepairOrder[]>([])
  const repairOrders = ref<RepairOrder[]>([])
  const earnings = ref<number | null>(null)
  const earningDetails = ref<WorkerEarning | null>(null)
  const workerPerformance = ref<WorkerPerformance | null>(null)
  const settlementRecords = ref<MonthlySettlement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const materials = ref<Material[]>([])

  // Computed properties
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

  // Helper functions
  const getCurrentMonthEarnings = (): number => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    const monthlyRecord = settlementRecords.value.find(record => 
      record.settlementMonth === currentMonth && record.settlementYear === currentYear
    )
    
    return monthlyRecord?.totalSalary || 0
  }

  // Generic API request handler to reduce duplication
  const executeApiRequest = async <T>(
    apiCall: () => Promise<T>,
    errorMessage: string
  ): Promise<T> => {
    loading.value = true
    error.value = null
    
    try {
      return await apiCall()
    } catch (err) {
      console.error(`${errorMessage}:`, err)
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions
  const fetchAssignedOrders = async () => {
    return executeApiRequest(
      async () => {
        const response = await workerService.getAssignedOrders()
        assignedOrders.value = response.data
        return response
      },
      '获取已分配工单失败'
    )
  }

  const fetchRepairOrders = async () => {
    return executeApiRequest(
      async () => {
        const response = await workerService.getRepairOrders()
        repairOrders.value = response.data
        return response
      },
      '获取维修工单失败'
    )
  }

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    // Update both arrays for consistent state
    const updateArray = (orders: RepairOrder[]) => {
      const index = orders.findIndex(order => order.orderId === orderId)
      if (index !== -1) {
        orders[index] = { ...orders[index], status: newStatus }
      }
    }
    
    updateArray(assignedOrders.value)
    updateArray(repairOrders.value)
  }

  const acceptOrder = async (orderId: number) => {
    return executeApiRequest(
      async () => {
        const response = await workerService.acceptOrder(orderId)
        updateOrderStatus(orderId, 'ACCEPTED')
        await fetchAssignedOrders()
        return response
      },
      '接受工单失败'
    )
  }

  const rejectOrder = async (orderId: number, reason: string) => {
    if (!reason || reason.trim() === '') {
      throw new Error('拒绝原因不能为空')
    }
    
    return executeApiRequest(
      async () => {
        const response = await workerService.rejectOrder(orderId, { reason })
        updateOrderStatus(orderId, 'REJECTED')
        await fetchAssignedOrders()
        return response
      },
      '拒绝工单失败'
    )
  }

  const startOrder = async (orderId: number) => {
    return executeApiRequest(
      async () => {
        const response = await workerService.startOrder(orderId)
        updateOrderStatus(orderId, 'IN_PROGRESS')
        await fetchAssignedOrders()
        return response
      },
      '开始维修失败'
    )
  }

  const completeOrder = async (orderId: number, data: {
    laborHours: number
    description: string
    suggestion: string
  }) => {
    return executeApiRequest(
      async () => {
        const response = await workerService.completeOrder(orderId, data)
        updateOrderStatus(orderId, 'COMPLETED')
        await fetchAssignedOrders()
        return response
      },
      '完成工单失败'
    )
  }

  const addMaterial = async (orderId: number, data: {
    name: string
    quantity: number
    unitPrice: number
    supplier: string
  }) => {
    return executeApiRequest(
      async () => {
        const response = await workerService.addMaterial(orderId, data)
        // Refresh materials after adding a new one
        await fetchMaterials(orderId)
        return response
      },
      '添加材料失败'
    )
  }

  const fetchMaterials = async (orderId: number) => {
    return executeApiRequest(
      async () => {
        const response = await workerService.getMaterials(orderId)
        materials.value = response.data
        return response
      },
      '获取材料列表失败'
    )
  }

  const fetchEarnings = async () => {
    return executeApiRequest(
      async () => {
        const response = await workerService.getEarnings()
        earnings.value = response.data
        return response
      },
      '获取收入信息失败'
    )
  }

  const fetchEarningDetails = async () => {
    return executeApiRequest(
      async () => {
        const response = await workerService.getEarningDetails()
        earningDetails.value = response.data
        return response
      },
      '获取收入详情失败'
    )
  }

  const fetchWorkerPerformance = async () => {
    return executeApiRequest(
      async () => {
        const response = await workerService.getWorkerPerformance()
        workerPerformance.value = response.data
        return response
      },
      '获取工作绩效失败'
    )
  }

  const fetchSettlementRecords = async () => {
    return executeApiRequest(
      async () => {
        const response = await workerService.getSettlementRecords()
        settlementRecords.value = response.data
        return response
      },
      '获取结算记录失败'
    )
  }

  // Load initial data
  const initializeStore = async () => {
    try {
      loading.value = true
      await Promise.all([
        fetchRepairOrders(),
        fetchEarnings(),
        fetchWorkerPerformance(),
        fetchSettlementRecords()
      ])
    } catch (err) {
      console.error('初始化工人数据失败:', err)
      error.value = '初始化数据失败'
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    assignedOrders,
    repairOrders,
    earnings,
    earningDetails,
    workerPerformance,
    settlementRecords,
    loading,
    error,
    materials,
    
    // Computed
    performanceEarnings,
    
    // Actions
    fetchAssignedOrders,
    fetchRepairOrders,
    acceptOrder,
    rejectOrder,
    startOrder,
    completeOrder,
    addMaterial,
    fetchMaterials,
    fetchEarnings,
    fetchEarningDetails,
    fetchWorkerPerformance,
    fetchSettlementRecords,
    initializeStore
  }
})