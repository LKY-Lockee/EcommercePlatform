import api from './index'

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  avatar?: string
  role: string
  created_at?: string
}

export interface Address {
  id: number
  user_id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default: boolean
  created_at: string
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  phone?: string
}

export interface LoginResponse {
  message: string
  user: User
  token: string
}

// 用户登录
export const login = (data: LoginData) => api.post<LoginResponse>('/users/login', data)

// 用户注册
export const register = (data: RegisterData) => api.post<LoginResponse>('/users/register', data)

// 获取用户信息
export const getProfile = () => api.get<{ user: User }>('/users/profile')

// 更新用户信息
export const updateProfile = (data: Partial<User>) => api.put('/users/profile', data)

// 修改密码
export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  api.put('/users/change-password', data)

// 获取用户地址列表
export const getAddresses = () => api.get<Address[]>('/users/addresses')

// 添加地址
export const addAddress = (data: Omit<Address, 'id' | 'user_id' | 'created_at'>) =>
  api.post<Address>('/users/addresses', data)

// 更新地址
export const updateAddress = (id: number, data: Partial<Address>) =>
  api.put(`/users/addresses/${id}`, data)

// 删除地址
export const deleteAddress = (id: number) => api.delete(`/users/addresses/${id}`)

// 设置默认地址
export const setDefaultAddress = (id: number) => api.put(`/users/addresses/${id}/default`)

export const userAPI = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
}
