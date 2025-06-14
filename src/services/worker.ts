import api from './api'
import type { RepairOrder, Material, ApiResponse, ProcessOrderRes, Earning, Performance, RepairLog } from '@/types'

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

  // 完成工单
  async completeOrder(orderId: number,
    data: {
      laborHours: number
      description: string
      suggestion: string
  }): Promise<ApiResponse<ProcessOrderRes>> {
    return api.put(`/v1/repair-orders/${orderId}/completion`, data).then((res) => res.data)
  },

  // 添加维修材料
  async addMaterial(orderId: number,
    data: {
      name: string
      quantity: number
      unitPrice: number
      supplier: string
  }): Promise<ApiResponse<Material>> {
    return api.post('/v1/repair-orders/${orderId}/materials', data).then((res) => res.data)
  },

  // 查询工资收入
  async getEarnings(): Promise<ApiResponse<Earning>> {
    return api.get('/v1/earnings').then((res) => res.data)
  },

  // 查询绩效
  async getPerformance(): Promise<ApiResponse<Performance>> {
    return api.get('/v1/performance').then((res) => res.data)
  },

  // 获取维修记录
  async getRepairLogs(): Promise<ApiResponse<RepairLog[]>> {
    return api.get('/v1/workers/repair-logs').then((res) => res.data)
  },
}
