import request from './index'

export interface Order {
  id: number
  order_number: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  shipping_address: string
  payment_method: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
}

export interface CreateOrderData {
  shipping_address: string
  payment_method: string
  cart_items: Array<{
    product_id: number
    quantity: number
  }>
}

// 创建订单
export const createOrder = (data: CreateOrderData) => {
  return request.post<{ message: string; order: Partial<Order> }>('/orders/create', data)
}

// 获取订单列表
export const getOrders = () => {
  return request.get<Order[]>('/orders')
}

// 获取订单详情
export const getOrderDetail = (id: number) => {
  return request.get<Order>(`/orders/${id}`)
}

// 取消订单
export const cancelOrder = (id: number) => {
  return request.put(`/orders/${id}/cancel`)
}

// 支付订单
export const payOrder = (id: number) => {
  return request.put(`/orders/${id}/pay`)
}
