// ===== 核心基础类型 =====

// 分页查询参数
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

// 分页响应
export interface PaginationResponse<T> {
  items: T[]
  pagination: { current_page: number; per_page: number; total: number; total_pages: number }
}

// ===== 用户相关类型 =====

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  avatar?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at?: string
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

// ===== 地址相关类型 =====

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

export interface AddressCreateData {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default?: boolean
}

// ===== 分类相关类型 =====

export interface Category {
  id: number
  name: string
  description?: string
  image?: string
  created_at: string
  children?: Category[]
}

export interface CategoryCreateData {
  name: string
  description?: string
  image?: string
}

// ===== 商品相关类型 =====

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  is_primary: boolean
  sort_order: number
  alt_text?: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  original_price?: number
  stock: number
  category_id: number
  brand?: string
  sku: string
  status: 'active' | 'inactive' | 'out_of_stock'
  featured: number
  image: string
  views?: number
  sales?: number
  rating?: number
  rating_count?: number
  created_at: string
  updated_at?: string
}

export interface ProductCreateData {
  name: string
  description: string
  price: number
  original_price?: number
  stock: number
  category_id: number
  brand?: string
  sku: string
  status?: 'active' | 'inactive'
  featured?: number
  image?: string
  specifications?: Record<string, unknown>
}

export interface ProductListParams extends PaginationParams {
  category_id?: number
  brand?: string
  min_price?: number
  max_price?: number
  featured?: boolean
  status?: string
  sort_by?: 'created_at' | 'price' | 'sales' | 'rating'
  sort_order?: 'asc' | 'desc'
}

// ===== 购物车相关类型 =====

export interface CartItem {
  id: number
  user_id: number
  product_id: number
  quantity: number
  created_at: string
  updated_at: string
  name: string
  description: string
  price: string
  image: string
  original_price: string
  stock: number
  category_id: number
  brand: string
  sku: string
  status: string
  featured: number
  views: number
  sales: number
  rating: string
  rating_count: number
}

export interface CartItemData {
  product_id: number
  quantity: number
}

// ===== 订单相关类型 =====

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  product_image: string
  product_price: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: number
  order_number: string
  user_id: number
  user?: User
  status: OrderStatus
  payment_status: PaymentStatus
  total_amount: string
  shipping_address: string
  payment_method: string
  items: OrderItem[]
  created_at: string
  updated_at?: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string
}

export interface OrderCreateData {
  shipping_address: string
  payment_method: string
  cart_items: Array<{
    product_id: number
    quantity: number
  }>
}

export interface OrderListParams extends PaginationParams {
  status?: OrderStatus
  user_id?: number
  start_date?: string
  end_date?: string
}

// ===== 横幅广告相关类型 =====

export interface Banner {
  id: number
  title: string
  subtitle?: string
  image: string
  link?: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface BannerCreateData {
  title: string
  image: string
  link?: string
  sort_order?: number
  is_active?: boolean
}

// ===== 管理员相关类型 =====

export interface AdminStats {
  users: number
  products: number
  orders: number
  revenue: number
  recentOrders: Order[]
}

export interface AdminUser extends User {
  // 管理员用户扩展字段
  last_login_at?: string
  login_count?: number
}

export interface AdminProduct extends Product {
  // 管理员商品扩展字段
  sales_count?: number
  view_count?: number
}

export interface AdminOrder extends Order {
  // 管理员订单扩展字段
  user: User
}

// ===== 管理员查询参数 =====

export interface AdminUserListParams extends PaginationParams {
  role?: string
  status?: string
}

// 管理员商品查询参数继承基础商品查询参数
export type AdminProductListParams = ProductListParams

// 管理员订单查询参数继承基础订单查询参数
export type AdminOrderListParams = OrderListParams
