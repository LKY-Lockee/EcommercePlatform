import api from './index'

export interface Product {
  id: number
  name: string
  description: string
  price: number | string
  original_price?: number | string
  stock: number
  category_id: number
  category_name?: string
  brand?: string
  sku?: string
  status: string
  featured: boolean
  views: number
  sales: number
  rating: number | string
  rating_count: number
  primary_image?: string
  images?: ProductImage[]
  created_at: string
}

export interface ProductImage {
  image_url: string
  is_primary: boolean
  sort_order: number
}

export interface ProductListParams {
  page?: number
  limit?: number
  category_id?: number
  search?: string
  sort_by?: 'created_at' | 'price' | 'sales' | 'rating'
  sort_order?: 'ASC' | 'DESC'
  featured?: boolean
  min_price?: number
  max_price?: number
}

export interface ProductListResponse {
  products: Product[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export const productAPI = {
  // 获取商品列表
  getProducts: (params?: ProductListParams) =>
    api.get<ProductListResponse>('/products', { params }),

  // 获取商品详情
  getProduct: (id: number) => api.get<Product>(`/products/${id}`),

  // 获取推荐商品
  getFeaturedProducts: (limit = 8) =>
    api.get<ProductListResponse>('/products', {
      params: { featured: true, limit },
    }),
}

// 单独导出便于使用
export const getProducts = productAPI.getProducts
export const getProduct = productAPI.getProduct
export const getFeaturedProducts = productAPI.getFeaturedProducts
