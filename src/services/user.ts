// src/services/user.ts
import api from './api'
import type { Vehicle, RepairOrder, RepairLog, Feedback, ApiResponse } from '@/types'

export const userService = {
  // 提交维修申请
  async submitRepair(data: {
    vehicleId: number
    issue: string
    repairType: string
    additionalInfo?: string
  }): Promise<ApiResponse<RepairOrder>> {
    return api.post('/v1/repair-orders', data).then((res) => res.data)
  },

  // 获取用户车辆
  async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    return api.get('/v1/vehicles').then((res) => res.data)
  },

  // 添加车辆
  async addVehicle(data: Omit<Vehicle, 'vehicleId'>): Promise<ApiResponse<Vehicle>> {
    return api.post('/v1/vehicles', data).then((res) => res.data)
  },

  // 获取维修记录
  async getRepairLogs(): Promise<ApiResponse<RepairLog[]>> {
    return api.get('/v1/users/repair-logs').then((res) => res.data)
  },

  // 获取维修工单
  async getRepairOrders(): Promise<ApiResponse<RepairOrder[]>> {
    return api.get('/v1/users/repair-orders').then((res) => res.data)
  },

  // 提交反馈
  async submitFeedback(data: {
    OrderId: number
    rating: number
    content: string
    category: string
  }): Promise<ApiResponse<Feedback>> {
    return api.post('/v1/feedbacks', data).then((res) => res.data)
  },
}
