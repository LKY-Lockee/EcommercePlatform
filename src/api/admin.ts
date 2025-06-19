import request from './index'
import type {
  AdminStats,
  AdminUser,
  AdminProduct,
  AdminOrder,
  AdminUserListParams,
  AdminProductListParams,
  AdminOrderListParams,
  ProductCreateData,
  Category,
  CategoryCreateData,
  Banner,
  BannerCreateData,
  PaginationResponse,
} from '@/types'

// ===== 管理员统计数据 =====

// 获取仪表盘统计数据
export const getDashboardStats = () => request.get<AdminStats>('/admin/dashboard')

// ===== 用户管理 =====

// 获取用户列表
export const getAdminUsers = (params?: AdminUserListParams) =>
  request.get<PaginationResponse<AdminUser>>('/admin/users', { params })

// 获取用户详情
export const getAdminUserDetail = (id: number) => request.get<AdminUser>(`/admin/users/${id}`)

// 更新用户信息
export const updateAdminUser = (id: number, data: Partial<AdminUser>) =>
  request.put<AdminUser>(`/admin/users/${id}`, data)

// 删除用户
export const deleteUser = (id: number) => request.delete<{ message: string }>(`/admin/users/${id}`)

// 批量删除用户
export const deleteUsers = (ids: number[]) =>
  request.post<{ message: string }>('/admin/users/batch-delete', { ids })

// 重置用户密码
export const resetUserPassword = (id: number) =>
  request.put<{ message: string; password: string }>(`/admin/users/${id}/reset-password`)

// ===== 商品管理 =====

// 获取商品列表
export const getAdminProducts = (params?: AdminProductListParams) =>
  request.get<PaginationResponse<AdminProduct>>('/admin/products', { params })

// 获取商品详情
export const getAdminProductDetail = (id: number) =>
  request.get<AdminProduct>(`/admin/products/${id}`)

// 创建商品
export const createProduct = (data: ProductCreateData) =>
  request.post<AdminProduct>('/admin/products', data)

// 更新商品
export const updateProduct = (id: number, data: Partial<ProductCreateData>) =>
  request.put<AdminProduct>(`/admin/products/${id}`, data)

// 删除商品
export const deleteProduct = (id: number) =>
  request.delete<{ message: string }>(`/admin/products/${id}`)

// 批量删除商品
export const deleteProducts = (ids: number[]) =>
  request.post<{ message: string }>('/admin/products/batch-delete', { ids })

// 上传商品图片
export const uploadProductImage = (file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  return request.post<{ url: string }>('/admin/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ===== 订单管理 =====

// 获取订单列表
export const getAdminOrders = (params?: AdminOrderListParams) =>
  request.get<PaginationResponse<AdminOrder>>('/admin/orders', { params })

// 获取订单详情
export const getAdminOrderDetail = (id: number) => request.get<AdminOrder>(`/admin/orders/${id}`)

// 更新订单状态
export const updateAdminOrder = (id: number, data: { status: string }) =>
  request.put<AdminOrder>(`/admin/orders/${id}`, data)

// 删除订单
export const deleteAdminOrder = (id: number) => request.delete(`/admin/orders/${id}`)

// ===== 分类管理 =====

// 获取所有分类
export const getAdminCategories = () => request.get<Category[]>('/admin/categories')

// 创建分类
export const createCategory = (data: CategoryCreateData) =>
  request.post<Category>('/admin/categories', data)

// 更新分类
export const updateCategory = (id: number, data: Partial<CategoryCreateData>) =>
  request.put<Category>(`/admin/categories/${id}`, data)

// 删除分类
export const deleteCategory = (id: number) =>
  request.delete<{ message: string }>(`/admin/categories/${id}`)

// 批量删除分类
export const deleteCategories = (ids: number[]) =>
  request.post<{ message: string }>('/admin/categories/batch-delete', { ids })

// 上传分类图片
export const uploadCategoryImage = (file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  return request.post<{ url: string }>('/admin/categories/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ===== 横幅管理 =====

// 获取所有横幅
export const getAdminBanners = () => request.get<Banner[]>('/admin/banners')

// 创建横幅
export const createBanner = (data: BannerCreateData) => request.post<Banner>('/admin/banners', data)

// 更新横幅
export const updateBanner = (id: number, data: Partial<BannerCreateData>) =>
  request.put<Banner>(`/admin/banners/${id}`, data)

// 删除横幅
export const deleteBanner = (id: number) =>
  request.delete<{ message: string }>(`/admin/banners/${id}`)

// 批量删除横幅
export const deleteBanners = (ids: number[]) =>
  request.post<{ message: string }>('/admin/banners/batch-delete', { ids })

// 上传横幅图片
export const uploadBannerImage = (file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  return request.post<{ url: string }>('/admin/banners/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ===== 系统设置 =====

// 获取系统设置
export const getSystemSettings = () => request.get<Record<string, unknown>>('/admin/settings')

// 更新系统设置
export const updateSystemSettings = (data: Record<string, unknown>) =>
  request.put<{ message: string }>('/admin/settings', data)
