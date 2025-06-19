import request from './index'
import type {
  Order,
  OrderCreateData,
  OrderListParams,
  PaginationResponse,
} from '@/types'

// ===== 用户订单相关 =====

// 创建订单
export const createOrder = (data: OrderCreateData) =>
  request.post<Order>('/orders/create', data)

// 获取用户订单列表
export const getUserOrders = (params?: OrderListParams) =>
  request.get<Order[]>('/orders', { params })

// 获取订单详情
export const getOrderDetail = (id: number) => request.get<Order>(`/orders/${id}`)

// 取消订单
export const cancelOrder = (id: number) =>
  request.put<{ message: string }>(`/orders/${id}/cancel`)

// 支付订单
export const payOrder = (id: number, paymentMethod?: string) =>
  request.put<{ message: string }>(`/orders/${id}/pay`, { paymentMethod })

// 确认收货
export const confirmOrder = (id: number) =>
  request.put<{ message: string }>(`/orders/${id}/confirm`)

// ===== 管理员订单管理 =====

// 获取所有订单列表
export const getAdminOrders = (params?: OrderListParams) =>
  request.get<PaginationResponse<Order>>('/admin/orders', { params })

// 更新订单状态
export const updateOrderStatus = (id: number, status: string) =>
  request.put<{ message: string }>(`/admin/orders/${id}/status`, { status })

// 发货
export const shipOrder = (id: number, trackingNumber?: string) =>
  request.put<{ message: string }>(`/admin/orders/${id}/ship`, { trackingNumber })

// 完成订单
export const completeOrder = (id: number) =>
  request.put<{ message: string }>(`/admin/orders/${id}/complete`)

// 删除订单
export const deleteOrder = (id: number) =>
  request.delete<{ message: string }>(`/admin/orders/${id}`)

// 批量更新订单状态
export const batchUpdateOrderStatus = (ids: number[], status: string) =>
  request.post<{ message: string }>('/admin/orders/batch-update-status', {
    ids,
    status,
  })
