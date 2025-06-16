import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userAPI, type User, type LoginData, type RegisterData } from '@/api/user'

interface ErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // 初始化用户信息
  const initUser = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        logout()
      }
    }
  }

  // 登录
  const login = async (loginData: LoginData) => {
    try {
      const response = await userAPI.login(loginData)
      const { user: userData, token: userToken } = response.data

      user.value = userData
      token.value = userToken

      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', userToken)

      return { success: true, data: response.data }
    } catch (error: unknown) {
      const err = error as ErrorResponse
      return {
        success: false,
        message: err.response?.data?.message || '登录失败',
      }
    }
  }

  // 注册
  const register = async (registerData: RegisterData) => {
    try {
      const response = await userAPI.register(registerData)
      const { user: userData, token: userToken } = response.data

      user.value = userData
      token.value = userToken

      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', userToken)

      return { success: true, data: response.data }
    } catch (error: unknown) {
      const err = error as ErrorResponse
      return {
        success: false,
        message: err.response?.data?.message || '注册失败',
      }
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // 获取用户信息
  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      user.value = response.data.user
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return { success: true }
    } catch (error: unknown) {
      const err = error as ErrorResponse
      return {
        success: false,
        message: err.response?.data?.message || '获取用户信息失败',
      }
    }
  }

  // 更新用户信息
  const updateProfile = async (userData: Partial<User>) => {
    try {
      await userAPI.updateProfile(userData)
      if (user.value) {
        user.value = { ...user.value, ...userData }
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      return { success: true }
    } catch (error: unknown) {
      const err = error as ErrorResponse
      return {
        success: false,
        message: err.response?.data?.message || '更新用户信息失败',
      }
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    initUser,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
  }
})
