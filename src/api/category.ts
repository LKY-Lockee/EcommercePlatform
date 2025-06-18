import request from './index'
import type { Category, ApiResponse } from '@/types'

// ===== 分类查询相关 =====

// 获取所有分类（包含层级结构）
export const getCategories = () => request.get<ApiResponse<Category[]>>('/categories')

// 获取分类详情
export const getCategoryDetail = (id: number) =>
  request.get<ApiResponse<Category>>(`/categories/${id}`)

// 获取顶级分类
export const getTopCategories = () => request.get<ApiResponse<Category[]>>('/categories/top')

// 获取子分类
export const getSubCategories = (parentId: number) =>
  request.get<ApiResponse<Category[]>>(`/categories/${parentId}/children`)
