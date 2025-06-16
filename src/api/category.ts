import api from './index'

export interface Category {
  id: number
  name: string
  description?: string
  image?: string
  parent_id?: number
  sort_order: number
  is_active: boolean
  created_at: string
}

// 获取所有分类
export const getCategories = () => api.get<Category[]>('/categories')

// 获取分类详情
export const getCategory = (id: number) => api.get<Category>(`/categories/${id}`)

export const categoryAPI = {
  getCategories,
  getCategory,
}
