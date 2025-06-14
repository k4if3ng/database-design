import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth'
import type { User, Worker, LoginRequest, LoginResponse } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | Worker | null>(null)
  const userRole = ref<string | null>(localStorage.getItem('userRole'))

  const isAuthenticated = computed(() => !!token.value)
  const isUser = computed(() => userRole.value === 'USER')
  const isWorker = computed(() => userRole.value === 'WORKER')
  const isAdmin = computed(() => userRole.value === 'ADMIN')

  const login = async (credentials: LoginRequest, role: 'user' | 'worker' | 'admin' = 'user') => {
    try {
      let response: LoginResponse

      switch (role) {
        case 'worker':
          response = (await authService.workerLogin(credentials)).data
          break
        case 'admin':
          response = (await authService.adminLogin(credentials)).data
          break
        default:
          response = (await authService.login(credentials)).data
      }

      token.value = response.token
      userRole.value = response.role

      localStorage.setItem('token', response.token)
      localStorage.setItem('userRole', response.role)
      localStorage.setItem('id', response.id.toString())

      console.log('Login:', response)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    userRole.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
  }

  const fetchUserInfo = async () => {
    try {
      if (isUser.value) {
        user.value = (await authService.getUserInfo()).data
      } else if (isWorker.value) {
        user.value = (await authService.getWorkerInfo()).data
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  const updateUserInfo = async (data: Partial<User>) => {
    try {
      if (isUser.value) {
        user.value = (await authService.updateUserInfo(data)).data
      }
    } catch (error) {
      console.error('Failed to update user info:', error)
    }
  }

  return {
    token,
    user,
    userRole,
    isAuthenticated,
    isUser,
    isWorker,
    isAdmin,
    login,
    logout,
    fetchUserInfo,
    updateUserInfo
  }
})
