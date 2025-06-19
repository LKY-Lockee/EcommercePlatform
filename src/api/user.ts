import request from './index'
import type {
  User,
  LoginData,
  RegisterData,
  LoginResponse,
  Address,
  AddressCreateData,
} from '@/types'

// ===== 用户认证相关 =====

// 用户登录
export const login = (data: LoginData) =>
  request.post<LoginResponse>('/users/login', data)

// 用户注册
export const register = (data: RegisterData) =>
  request.post<LoginResponse>('/users/register', data)

// 获取用户信息
export const getUserInfo = () => request.get<User>('/users/profile')

// 更新用户信息
export const updateUserInfo = (data: Partial<User>) =>
  request.put<User>('/users/profile', data)

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) =>
  request.put<{ message: string }>('/users/password', data)

// ===== 地址管理相关 =====

// 获取用户地址列表
export const getUserAddresses = () => request.get<Address[]>('/users/addresses')

// 创建地址
export const createAddress = (data: AddressCreateData) =>
  request.post<Address>('/users/addresses', data)

// 更新地址
export const updateAddress = (id: number, data: Partial<AddressCreateData>) =>
  request.put<Address>(`/users/addresses/${id}`, data)

// 删除地址
export const deleteAddress = (id: number) =>
  request.delete<{ message: string }>(`/users/addresses/${id}`)

// 设置默认地址
export const setDefaultAddress = (id: number) =>
  request.put<{ message: string }>(`/users/addresses/${id}/default`)
