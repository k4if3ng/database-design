import api from './api'
import type { RepairOrder, Material, ApiResponse, ProcessOrderRes, WorkerEarning, MonthlySettlement, WorkerPerformance, RepairLog } from '@/types'

export const workerService = {
  // 获取分配的工单
  async getAssignedOrders(): Promise<ApiResponse<RepairOrder[]>> {
    return api.get('/v1/workers/repair-orders').then((res) => res.data)
  },

  // 接受工单
  async acceptOrder(orderId: number): Promise<ApiResponse<ProcessOrderRes>> {
    return api.put(`/v1/repair-orders/${orderId}/acceptance`).then((res) => res.data)
  },

  // 拒绝工单
  async rejectOrder(orderId: number, data: {reason: string}): Promise<ApiResponse<ProcessOrderRes>> {
    return api.put(`/v1/repair-orders/${orderId}/rejection`, data).then(response => response.data)
  },

  async startOrder(orderId: number): Promise<ApiResponse<ProcessOrderRes>> {
    return api.put(`/v1/repair-orders/${orderId}/start`).then((res) => res.data)
  },

  // 完成工单
  async completeOrder(orderId: number,
    data: {
      laborHours: number
      description: string
      suggestion: string
  }): Promise<ApiResponse<ProcessOrderRes>> {
    return api.put(`/v1/repair-orders/${orderId}/complete`, data).then((res) => res.data)
  },

  // 添加维修材料
  async addMaterial(orderId: number,
    data: {
      name: string
      quantity: number
      unitPrice: number
      supplier: string
  }): Promise<ApiResponse<Material>> {
    return api.post(`/v1/repair-orders/${orderId}/materials`, data).then((res) => res.data)
  },

  // 获取材料列表
  async getMaterials(orderId: number): Promise<ApiResponse<Material[]>> {
    return api.get(`/v1/repair-orders/${orderId}/materials`).then((res) => res.data)
  },

  // 查询工资收入
  async getEarnings(): Promise<ApiResponse<number>> {
    return api.get('/v1/earnings').then((res) => res.data)
  },

  // 查询绩效
  async getWorkerPerformance(): Promise<ApiResponse<WorkerPerformance>> {
    return api.get('/v1/performance').then((res) => res.data)
  },

  // 结算记录
  async getSettlementRecords(): Promise<ApiResponse<MonthlySettlement[]>> {
    return api.get('/v1/settlements').then((res) => res.data)
  },

  // 获取维修记录
  async getRepairOrders(): Promise<ApiResponse<RepairOrder[]>> {
    return api.get('/v1/workers/repair-orders').then((res) => res.data)
  },

  // 详细收入信息
  async getEarningDetails(): Promise<ApiResponse<WorkerEarning>> {
    return api.get('/v1/query/detailed-earnings').then((res) => res.data)
  }
}
