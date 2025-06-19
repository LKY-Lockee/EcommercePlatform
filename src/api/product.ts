import request from './index'
import type { Product, ProductListParams, PaginationResponse } from '@/types'

// ===== 商品查询相关 =====

// 获取商品列表
export const getProducts = (params?: ProductListParams) =>
  request.get<PaginationResponse<Product>>('/products', { params })

// 获取商品详情
export const getProductDetail = (id: number) => request.get<Product>(`/products/${id}`)

// 获取推荐商品
export const getFeaturedProducts = () => request.get<Product[]>('/products/featured')

// 获取热销商品
export const getHotProducts = () => request.get<Product[]>('/products/hot')

// 获取新品
export const getNewProducts = () => request.get<Product[]>('/products/new')

// 根据分类获取商品
export const getProductsByCategory = (categoryId: number, params?: ProductListParams) =>
  request.get<PaginationResponse<Product>>(`/products/category/${categoryId}`, {
    params,
  })

// 搜索商品
export const searchProducts = (keyword: string, params?: ProductListParams) =>
  request.get<PaginationResponse<Product>>('/products/search', {
    params: { ...params, keyword },
  })
