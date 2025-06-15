import api from './api'
import type {
  User,
  Worker,
  RepairLog,
  RepairOrder,
  ApiResponse,
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

export const adminService = {
  // 获取所有用户
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return api.get('/v1/users').then((res) => res.data)
  },

  // 获取所有维修人员
  async getAllWorkers(): Promise<ApiResponse<Worker[]>> {
    return api.get('/v1/workers').then((res) => res.data)
  },

  // 获取所有维修工单
  async getAllRepairOrders(): Promise<ApiResponse<RepairOrder[]>> {
    return api.get('/v1/repair-orders').then((res) => res.data)
  },

  // 获取维修日志
  async getAllRepairLogs(): Promise<ApiResponse<RepairLog[]>> {
    return api.get('/v1/repair-logs').then((res) => res.data)
  },  

  // 分配工单
  async assignRepairOrder(orderId: number, data: {
    workerId: number
    priority: string
    estimatedHours: number
    notes: string
  }): Promise<ApiResponse<RepairOrder>> {
    return api.put(`/v1/repair-orders/${orderId}/assign`, data).then((res) => res.data)
  },

  // 批量提交维修工单
  async batchSubmitOrders(data: {
    batchId?: number
    processedCount: number
    orders: Partial<RepairOrder>[]
  }): Promise<ApiResponse<BatchSubmitOrders>> {
    return api.post('/v1/repairs/batch-submit', data).then((res) => res.data)
  },

  // 月度结算
  async executeMonthlySettlement(data: Partial<RepairOrder>): Promise<ApiResponse<MonthlySettlement[]>> {
    return api.post('/admin/monthly-settlement', data).then((res) => res.data)
  },

  // 获取车型维修统计
  async getVehicleRepairStats(): Promise<VehicleTypeStats> {
    return api.get('/statistics/vehicle-types').then((res) => res.data)
  },

  // 获取维修费用构成分析
  async getCostAnalysis(params: {
    period: string
    year: number
    month?: number
  }): Promise<ApiResponse<CostAnalysis>> {
    return api.get('/statistics/cost-analysis', { params }).then((res) => res.data)
  },

  // 获取负面反馈统计
  async getNegativeFeedback(params?: {
    rating?: number
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<NegativeFeedback>> {
    return api.get('/statistics/negative-feedback', { params }).then((res) => res.data)
  },

  // 获取工种任务统计
  async getSpecialtyWorkload(params?: {
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<SpecialtyWorkload[]>> {
    return api.get('/statistics/specialty-workload', { params }).then((res) => res.data)
  },

  // 分配工单
  async submitOrder(data: {
    workerId: number
    priority: string
    estimatedHours: number
    notes: string
  }): Promise<ApiResponse<RepairOrder>> {
    return api.put(`/v1/repair-orders/submit`, data).then((res) => res.data)
  },

  // 获取未完成任务统计
  async getPendingTasks(): Promise<ApiResponse<PendingTasks>> {
    return api.get('/v1/repair-orders/pending-assignment').then((res) => res.data)
  },

  // 数据回滚
  async rollbackRepairOrder(orderId: number, data: {
    reason: string
    rollbackToStatus: string
  }): Promise<ApiResponse<RollBack>> {
    return api.post(`/admin/repair-orders/{orderId}/rollback`, data).then((res) => res.data)
  },

  // 批量删除工单
  async batchDeleteOrders(data: number[]): Promise<ApiResponse<BatchDeleteOrders>> {
    return api.delete('/v1/repair-orders/batch', { data }).then((res) => res.data)
  },

  // 查询审计日志
  async getAuditLogs(params?: {
    action?: string
    entityType?: string
    startDate?: string
    endDate?: string
    page?: number
    size?: number
  }): Promise<AuditLog> {
    return api.get('/admin/audit-logs', { params }).then((res) => res.data)
  },

  // 获取区块链证明
  async getBlockchainProof(orderId: number): Promise<ApiResponse<BlockchainProof>> {
    return api.get(`/admin/blockchain-proof/${orderId}/verify`).then((res) => res.data)
  },

  // 获取系统统计概览
  async getAdminStatisticsOverview(): Promise<ApiResponse<AdminStatisticsOverview>> {
    return api.get('/v1/statistics/overview').then((res) => res.data)
  },

  // 系统健康检查
  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    return api.get('/test/health').then((res) => res.data)
  },

  // 获取系统状态
  async getSystemStatus(): Promise<ApiResponse<SystemStatus>> {
    return api.get('/admin/system/status').then((res) => res.data)
  },
}