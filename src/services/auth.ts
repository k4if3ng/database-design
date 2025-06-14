import api from './api'
import type { LoginRequest, RegisterRequest, LoginResponse, User, ApiResponse } from '@/types'

export const authService = {
  // 用户注册
  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    return api.post('/v1/auth/users/register', data).then((res) => res.data)
  },

  // 用户登录
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return api.post('/v1/auth/users/tokens', data).then((res) => res.data)
  },

  // 获取用户信息
  async getUserInfo(): Promise<ApiResponse<User>> {
    return api.get('/v1/users/profile').then((res) => res.data)
  },

  // 更新用户信息
  async updateUserInfo(data: Partial<User>): Promise<ApiResponse<User>> {
    return api.put('/v1/users/profile', data).then((res) => res.data)
  },

  // 维修人员登录
  async workerLogin(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return api.post('/v1/auth/workers/tokens', data).then((res) => res.data)
  },

  // 获取维修人员信息
  async getWorkerInfo(): Promise<ApiResponse<any>> {
    return api.get('/v1/workers/profile').then((res) => res.data)
  },

  // 管理员登录
  async adminLogin(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return api.post('/v1/auth/admins/tokens', data).then((res) => res.data)
  },
}
