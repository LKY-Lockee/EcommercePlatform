import request from './index'

export interface AdminStats {
  users: number
  products: number
  orders: number
  revenue: number
  recentOrders: Array<{
    id: number
    orderNumber: string
    total: number
    status: string
    createdAt: string
  }>
}

export interface AdminUser {
  id: number
  username: string
  email: string
  phone: string
  role: string
  avatar?: string
  created_at: string
}

export interface AdminProduct {
  id: number
  name: string
  description: string
  price: number
  original_price: number
  stock: number
  category_id: number
  category_name: string
  brand: string
  sku: string
  status: string
  featured: boolean
  image_url: string
  created_at: string
}

export interface AdminOrder {
  id: number
  order_number: string
  user_id: number
  username: string
  email: string
  status: string
  total_amount: number
  shipping_address: string
  payment_method: string
  payment_status: string
  created_at: string
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  limit: number
  data?: T[]
  users?: T[]
  products?: T[]
  orders?: T[]
}

// 获取仪表板数据
export const getDashboardStats = () => {
  return request.get<AdminStats>('/admin/dashboard')
}

// 用户管理
export const getAdminUsers = (params: { page?: number; limit?: number; search?: string }) => {
  return request.get<PaginatedResponse<AdminUser>>('/admin/users', { params })
}

export const deleteUser = (id: number) => {
  return request.delete(`/admin/users/${id}`)
}

// 商品管理
export const getAdminProducts = (params: {
  page?: number
  limit?: number
  search?: string
  category?: string
}) => {
  return request.get<PaginatedResponse<AdminProduct>>('/admin/products', { params })
}

export const createProduct = (data: Partial<AdminProduct>) => {
  return request.post('/admin/products', data)
}

export const updateProduct = (id: number, data: Partial<AdminProduct>) => {
  return request.put(`/admin/products/${id}`, data)
}

export const deleteProduct = (id: number) => {
  return request.delete(`/admin/products/${id}`)
}

// 订单管理
export const getAdminOrders = (params: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) => {
  return request.get<PaginatedResponse<AdminOrder>>('/admin/orders', { params })
}

export const updateOrderStatus = (id: number, status: string) => {
  return request.put(`/admin/orders/${id}/status`, { status })
}

// 新增的订单管理接口
export const getOrders = (params: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  startDate?: string
  endDate?: string
}) => {
  return request.get('/admin/orders', { params })
}

export const getOrderDetail = (id: number) => {
  return request.get(`/admin/orders/${id}`)
}

// 导出为默认对象供组件使用
export const adminApi = {
  getDashboardStats,
  getAdminUsers,
  deleteUser,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getOrders,
  getOrderDetail,
}
