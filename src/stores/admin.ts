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
  SpecialtyWorkload,
  PendingTasks,
  RollBack,
  BatchDeleteOrders,
  AuditLog,
  AdminStatisticsOverview,
  BlockchainProof,
  SystemHealth,
  SystemStatus,
} from '@/types'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as User[],
    workers: [] as Worker[],
    repairLogs: [] as RepairLog[],
    repairOrders: [] as RepairOrder[],
    statisticsOverview: null as AdminStatisticsOverview | null,
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
        this.users = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取用户列表失败'
      } finally {
        this.loading = false
      }
    },

    async fetchWorkers() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getAllWorkers()
        this.workers = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取工人列表失败'
      } finally {
        this.loading = false
      }
    },

    async fetchRepairLogs() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getAllRepairLogs()
        this.repairLogs = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取维修日志失败'
      } finally {
        this.loading = false
      }
    },

    async fetchRepairOrders() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getAllRepairOrders()
        this.repairOrders = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取维修订单失败'
      } finally {
        this.loading = false
      }
    },

    async fetchStatisticsOverview() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getAdminStatisticsOverview()
        this.statisticsOverview = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取统计概览失败'
      } finally {
        this.loading = false
      }
    },

    async fetchSystemHealth() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getSystemHealth()
        this.systemHealth = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统健康状态失败'
      } finally {
        this.loading = false
      }
    },

    async fetchSystemStatus() {
      this.loading = true
      this.error = null
      try {
        const response = await adminService.getSystemStatus()
        this.systemStatus = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统状态失败'
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
      return await adminService.assignRepairOrder(orderId, data)
    },

    async batchSubmitOrders(data: {
      orders: {
        vehicleId: number
        issue: string
        repairType: string
        additionalInfo?: string
        priority?: string
      }[]
    }) {
      return await adminService.batchSubmitOrders(data)
    },

    async executeMonthlySettlement(data: {
      year: number
      month: number
    }) {
      return await adminService.executeMonthlySettlement(data)
    },

    async fetchVehicleRepairStats() {
      return await adminService.getVehicleRepairStats()
    },

    async fetchCostAnalysis(params: {
      period: string
      year: number
      month?: number
    }) {
      return await adminService.getCostAnalysis(params)
    },

    async fetchNegativeFeedback(params?: {
      rating?: number
      startDate?: string
      endDate?: string
    }) {
      return await adminService.getNegativeFeedback(params)
    },

    async fetchSpecialtyWorkload(params?: {
      startDate?: string
      endDate?: string
    }) {
      return await adminService.getSpecialtyWorkload(params)
    },

    async fetchPendingTasks() {
      return await adminService.getPendingTasks()
    },

    async rollbackRepairOrder(orderId: number, data: {
      reason: string
      rollbackToStatus: string
    }) {
      return await adminService.rollbackRepairOrder(orderId, data)
    },

    async batchDeleteOrders(data: number[]) {
      return await adminService.batchDeleteOrders(data)
    },

    async fetchAuditLogs(params?: {
      action?: string
      entityType?: string
      startDate?: string
      endDate?: string
      page?: number
      size?: number
    }) {
      return await adminService.getAuditLogs(params)
    },

    async fetchBlockchainProof(orderId: number) {
      return await adminService.getBlockchainProof(orderId)
    },
  },
})