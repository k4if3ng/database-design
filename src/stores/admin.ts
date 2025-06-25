import { defineStore } from 'pinia'
import { adminService } from '@/services/admin'
import type {
  User,
  Worker,
  RepairLog,
  RepairOrder,
  BatchSubmitOrders,
  MonthlySettlement,
  VehicleTypeStats,
  CostAnalysis,
  NegativeFeedback,
  SpecialtyWorkloadStats,
  PendingTasks,
  RollBack,
  BatchDeleteOrders,
  AuditLog,
  AdminStatisticsOverview,
  BlockchainProof,
  SystemHealth,
  SystemStatus,
  ApiResponse
} from '@/types'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as User[],
    workers: [] as Worker[],
    repairLogs: [] as RepairLog[],
    repairOrders: [] as RepairOrder[],
    statisticsOverview: null as AdminStatisticsOverview | null,
    vehicleTypeStats: null as VehicleTypeStats | null,
    costAnalysis: null as CostAnalysis | null,
    negativeFeedback: null as NegativeFeedback | null,
    specialtyWorkloadStats: [] as SpecialtyWorkloadStats[],
    pendingTasks: null as PendingTasks | null,
    auditLogs: null as AuditLog | null,
    systemHealth: null as SystemHealth | null,
    systemStatus: null as SystemStatus | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getAllUsers()
        if (response.success) {
          this.users = response.data
        } else {
          throw new Error(response.message || '获取用户列表失败')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取用户列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchWorkers() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getAllWorkers()
        if (response.success) {
          this.workers = response.data
        } else {
          throw new Error(response.message || '获取工人列表失败')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取工人列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchRepairOrders() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getAllRepairOrders()
        if (response.success) {
          this.repairOrders = response.data
        } else {
          throw new Error(response.message || '获取维修订单失败')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取维修订单失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchRepairLogs() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getAllRepairLogs()
        if (response.success) {
          this.repairLogs = response.data
        } else {
          throw new Error(response.message || '获取维修日志失败')
        } 
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取维修日志失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchStatisticsOverview() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getAdminStatisticsOverview()
        if (response.success) {
          this.statisticsOverview = response.data
        } else {
          throw new Error(response.message || '获取统计概览失败')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取统计概览失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchVehicleRepairStats() {
      this.loading = true
      this.error = null
      try {
        // 注意：这个方法返回的是VehicleTypeStats而不是ApiResponse
        const response = await adminService.getVehicleRepairStats()
        this.vehicleTypeStats = response
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取车型维修统计失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCostAnalysis(params: {
      period: string
      year: number
      month?: number
    }) {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getCostAnalysis(params)
        this.costAnalysis = response
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取成本分析失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchNegativeFeedback(params?: {
      rating?: number
      startDate?: string
      endDate?: string
    }) {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getNegativeFeedback(params)
        this.negativeFeedback = response
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取负面反馈统计失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSpecialtyWorkload(params?: {
      startDate?: string
      endDate?: string
    }) {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getSpecialtyWorkload(params)
        this.specialtyWorkloadStats = Array.isArray(response) ? response : [response]
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取工种工作量统计失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchPendingTasks() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getPendingTasks()
        if (response.success) {
          this.pendingTasks = response.data
        }
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取待处理任务统计失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAuditLogs(params?: {
      action?: string
      entityType?: string
      startDate?: string
      endDate?: string
      page?: number
      size?: number
    }) {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getAuditLogs(params)
        this.auditLogs = response
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取审计日志失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSystemHealth() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getSystemHealth()
        if (response.success) {
          this.systemHealth = response.data
        } else {
          throw new Error(response.message || '获取系统健康状态失败')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统健康状态失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSystemStatus() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getSystemStatus()
        if (response.success) {
          this.systemStatus = response.data
        } else {
          throw new Error(response.message || '获取系统状态失败')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统状态失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async assignRepairOrder(orderId: number, data: {
      workerId: number
      priority: string
      estimatedHours: number
      notes: string
    }) {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.assignRepairOrder(orderId, data)
        if (response.success) {
          // 更新本地数据
          const orderIndex = this.repairOrders.findIndex(order => order.orderId === orderId)
          if (orderIndex !== -1) {
            this.repairOrders[orderIndex] = response.data
          }
        }
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : '分配工单失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async executeMonthlySettlement(data: Partial<RepairOrder>) {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.executeMonthlySettlement(data)
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : '执行月度结算失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async rollbackRepairOrder(orderId: number, params: { targetTimestamp: string }) {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.rollbackRepairOrder(orderId, params)
        if (response.success) {
          // 重新获取订单列表以更新状态
          await this.fetchRepairOrders()
        }
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : '数据回滚失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async batchDeleteOrders(orderIds: number[]) {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.batchDeleteOrders(orderIds)
        if (response.success) {
          // 从本地数据中移除已删除的订单
          this.repairOrders = this.repairOrders.filter(
            order => !orderIds.includes(order.orderId)
          )
        }
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : '批量删除工单失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchBlockchainProof(orderId: number) {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getBlockchainProof(orderId)
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取区块链证明失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 清除错误状态
    clearError() {
      this.error = null
    },

    // 重置store状态
    reset() {
      this.users = []
      this.workers = []
      this.repairLogs = []
      this.repairOrders = []
      this.statisticsOverview = null
      this.vehicleTypeStats = null
      this.costAnalysis = null
      this.negativeFeedback = null
      this.specialtyWorkloadStats = []
      this.pendingTasks = null
      this.auditLogs = null
      this.systemHealth = null
      this.systemStatus = null
      this.loading = false
      this.error = null
    }
  },

  getters: {
    // 获取活跃维修工数量
    activeWorkersCount: (state) => {
      return state.workers.filter(worker => worker.status === 'ACTIVE').length
    },

    // 获取待分配订单数量
    pendingOrdersCount: (state) => {
      return state.repairOrders.filter(order => order.status === 'PENDING').length
    },

    // 获取进行中订单数量
    inProgressOrdersCount: (state) => {
      return state.repairOrders.filter(order => order.status === 'IN_PROGRESS').length
    },

    // 获取已完成订单数量
    completedOrdersCount: (state) => {
      return state.repairOrders.filter(order => order.status === 'COMPLETED').length
    },

    // 检查系统是否健康
    isSystemHealthy: (state) => {
      return state.systemHealth?.status === 'UP'
    }
  }
})