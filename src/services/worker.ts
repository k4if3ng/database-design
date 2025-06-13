// src/services/worker.ts
import api from './api'
import type { RepairOrder, Material, ApiResponse } from '@/types'

export const workerService = {
  // 获取分配的工单
  getAssignedOrders(): Promise<ApiResponse<RepairOrder[]>> {
    return api.get('/worker/repair-order').then((res) => res.data)
  },

  // 接受工单
  acceptOrder(data: { orderId: number }): Promise<ApiResponse<RepairOrder>> {
    return api.post('/worker/repair-order/accept', data).then((res) => res.data)
  },

  // 拒绝工单
  rejectOrder(data: { orderId: number }): Promise<ApiResponse<RepairOrder>> {
    return api.post('/worker/repair-order/reject', data).then((res) => res.data)
  },

  // 更新维修进度
  updateOrder(data: {
    orderId: number
    status: string
    description?: string
    repairResult?: string
    laborCost?: number
    laborHours?: number
  }): Promise<ApiResponse<RepairOrder>> {
    return api.post('/worker/repair-order/update', data).then((res) => res.data)
  },

  // 添加维修材料
  addMaterial(data: {
    orderId: number
    name: string
    quantity: number
    price: number
  }): Promise<ApiResponse<Material>> {
    return api.post('/worker/material', data).then((res) => res.data)
  },

  // 获取处理过的工单
  getProcessedOrders(): Promise<ApiResponse<RepairOrder[]>> {
    return api.get('/worker/query/repair-order').then((res) => res.data)
  },

  // 查询工资收入
  getEarnings(): Promise<ApiResponse<number>> {
    return api.get('/worker/query/earnings').then((res) => res.data)
  },

  // 查询工资收入详情
  getDetailedEarnings(): Promise<ApiResponse<any>> {
    return api.get('/worker/query/detailed-earnings').then((res) => res.data)
  },

  // 获取未完成任务统计
  getPendingStats(): Promise<ApiResponse<any>> {
    return api.get('/worker/statistics/pending-orders').then((res) => res.data)
  },
}
