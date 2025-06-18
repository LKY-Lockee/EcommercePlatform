import request from './index'
import type {
  User,
  LoginData,
  RegisterData,
  LoginResponse,
  Address,
  AddressCreateData,
  ApiResponse,
} from '@/types'

// ===== 用户认证相关 =====

// 用户登录
export const login = (data: LoginData) =>
  request.post<ApiResponse<LoginResponse>>('/users/login', data)

// 用户注册
export const register = (data: RegisterData) =>
  request.post<ApiResponse<LoginResponse>>('/users/register', data)

// 获取用户信息
export const getUserInfo = () => request.get<ApiResponse<User>>('/users/profile')

// 更新用户信息
export const updateUserInfo = (data: Partial<User>) =>
  request.put<ApiResponse<User>>('/users/profile', data)

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) =>
  request.put<ApiResponse<{ message: string }>>('/users/password', data)

// ===== 地址管理相关 =====

// 获取用户地址列表
export const getUserAddresses = () => request.get<ApiResponse<Address[]>>('/users/addresses')

// 创建地址
export const createAddress = (data: AddressCreateData) =>
  request.post<ApiResponse<Address>>('/users/addresses', data)

// 更新地址
export const updateAddress = (id: number, data: Partial<AddressCreateData>) =>
  request.put<ApiResponse<Address>>(`/users/addresses/${id}`, data)

// 删除地址
export const deleteAddress = (id: number) =>
  request.delete<ApiResponse<{ message: string }>>(`/users/addresses/${id}`)

// 设置默认地址
export const setDefaultAddress = (id: number) =>
  request.put<ApiResponse<{ message: string }>>(`/users/addresses/${id}/default`)
