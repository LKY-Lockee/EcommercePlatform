import request from './index'
import type { Category } from '@/types'

// ===== 分类查询相关 =====

// 获取所有分类（包含层级结构）
export const getCategories = () => request.get<Category[]>('/categories')

// 获取分类详情
export const getCategoryDetail = (id: number) =>
  request.get<Category>(`/categories/${id}`)
