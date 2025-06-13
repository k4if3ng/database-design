// src/services/auth.ts
import api from './api'
import type { LoginRequest, RegisterRequest, LoginResponse, User, ApiResponse } from '@/types'

export const authService = {
  // 用户注册
  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    return api.post('/account/register', data).then((res) => res.data)
  },

  // 用户登录
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return api.post('/account/token', data).then((res) => res.data)
  },

  // 获取用户信息
  async getUserInfo(): Promise<ApiResponse<User>> {
    return api.get('/account/info').then((res) => res.data)
  },

  // 维修人员登录
  async workerLogin(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return api.post('/worker/account/token', data).then((res) => res.data)
  },

  // 获取维修人员信息
  async getWorkerInfo(): Promise<ApiResponse<any>> {
    return api.get('/worker/account/info').then((res) => res.data)
  },

  // 管理员登录
  async adminLogin(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return api.post('/admin/account/token', data).then((res) => res.data)
  },
}
