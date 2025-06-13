// src/services/admin.ts
import api from './api'
import type { User, Worker, RepairLog, RepairOrder, SystemStats, ApiResponse } from '@/types'

export const adminService = {
  // 查询所有用户
  getAllUsers(): Promise<ApiResponse<User[]>> {
    return api.get('/admin/query/user').then((res) => res.data)
  },

  // 查询所有维修人员
  getAllWorkers(): Promise<ApiResponse<Worker[]>> {
    return api.get('/admin/query/worker').then((res) => res.data)
  },

  // 查询所有维修记录
  getAllRepairLogs(): Promise<ApiResponse<RepairLog[]>> {
    return api.get('/admin/query/repair-log').then((res) => res.data)
  },

  // 查询所有维修工单
  getAllRepairOrders(): Promise<ApiResponse<RepairOrder[]>> {
    return api.get('/admin/query/repair-order').then((res) => res.data)
  },

  // 获取系统统计数据
  getSystemStats(): Promise<ApiResponse<SystemStats>> {
    return api.get('/admin/monitor-info').then((res) => res.data)
  },

  // 执行月度结算
  executeMonthlySettlement(data: {
    year: number
    month: number
    settleIncomplete?: boolean
  }): Promise<ApiResponse<any>> {
    return api.post('/admin/monthly-settlement', data).then((res) => res.data)
  },

  // 获取工人结算记录
  getWorkerSettlements(params?: {
    year?: number
    month?: number
    workerId?: number
    status?: string
  }): Promise<ApiResponse<any[]>> {
    return api.get('/admin/worker-settlements', { params }).then((res) => res.data)
  },

  // 车型维修统计
  getVehicleTypeStats(params?: {
    startDate?: string
    endDate?: string
    vehicleType?: string
  }): Promise<ApiResponse<any>> {
    return api.get('/statistics/vehicle-types', { params }).then((res) => res.data)
  },

  // 成本分析
  getCostAnalysis(params: {
    period: string
    year: number
    quarter?: number
    month?: number
    repairType?: string
  }): Promise<ApiResponse<any>> {
    return api.get('/statistics/cost-analysis', { params }).then((res) => res.data)
  },

  // 负面反馈统计
  getNegativeFeedback(params?: {
    startDate?: string
    endDate?: string
    workerId?: number
    repairType?: string
  }): Promise<ApiResponse<any>> {
    return api.get('/statistics/negative-feedback', { params }).then((res) => res.data)
  },

  // 工种任务统计
  getSpecialtyWorkload(params?: {
    startDate?: string
    endDate?: string
    status?: string
  }): Promise<ApiResponse<any>> {
    return api.get('/statistics/specialty-workload', { params }).then((res) => res.data)
  },

  // 未完成任务统计
  getPendingOrdersStats(params?: {
    groupBy?: string
    status?: string
    minDays?: number
  }): Promise<ApiResponse<any>> {
    return api.get('/statistics/pending-orders', { params }).then((res) => res.data)
  },

  // 查询审计日志
  getAuditLogs(params?: {
    entityType?: string
    entityId?: number
    action?: string
    startTime?: string
    endTime?: string
    username?: string
    page?: number
    size?: number
  }): Promise<ApiResponse<any>> {
    return api.get('/admin/audit-logs', { params }).then((res) => res.data)
  },
}
