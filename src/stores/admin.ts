import { defineStore } from 'pinia'
import { adminService } from '@/services/admin'
import type {
  User,
  Worker,
  RepairLog,
  RepairOrder,
  BatchSubmitOrders,
  MonthlySettlement,
  VehicleRepairStats,
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
  }),

  actions: {
    async fetchUsers() {
      const response = await adminService.getAllUsers()
      this.users = response.data
    },

    async fetchWorkers() {
      const response = await adminService.getAllWorkers()
      this.workers = response.data
    },

    async fetchRepairLogs() {
      const response = await adminService.getAllRepairLogs()
      this.repairLogs = response.data
    },

    async fetchRepairOrders() {
      const response = await adminService.getAllRepairOrders()
      this.repairOrders = response.data
    },

    async fetchStatisticsOverview() {
      const response = await adminService.getAdminStatisticsOverview()
      this.statisticsOverview = response.data
    },

    async fetchSystemHealth() {
      const response = await adminService.getSystemHealth()
      this.systemHealth = response.data
    },

    async fetchSystemStatus() {
      const response = await adminService.getSystemStatus()
      this.systemStatus = response.data
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

    async getVehicleRepairStats() {
      return await adminService.getVehicleRepairStats()
    },

    async getCostAnalysis(params: {
      period: string
      year: number
      month?: number
    }) {
      return await adminService.getCostAnalysis(params)
    },

    async getNegativeFeedback(params?: {
      rating?: number
      startDate?: string
      endDate?: string
    }) {
      return await adminService.getNegativeFeedback(params)
    },

    async getSpecialtyWorkload(params?: {
      startDate?: string
      endDate?: string
    }) {
      return await adminService.getSpecialtyWorkload(params)
    },

    async getPendingTasks() {
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

    async getAuditLogs(params?: {
      action?: string
      entityType?: string
      startDate?: string
      endDate?: string
      page?: number
      size?: number
    }) {
      return await adminService.getAuditLogs(params)
    },

    async getBlockchainProof(orderId: number) {
      return await adminService.getBlockchainProof(orderId)
    },
  },
})