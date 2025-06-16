import request from './index'

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  name: string
  price: number
  image_url: string
  stock: number
  total_price: number
}

// 获取购物车
export const getCart = () => {
  return request.get<CartItem[]>('/cart')
}

// 添加到购物车
export const addToCart = (data: { product_id: number; quantity?: number }) => {
  return request.post('/cart/add', data)
}

// 更新购物车商品数量
export const updateCartItem = (id: number, quantity: number) => {
  return request.put(`/cart/${id}`, { quantity })
}

// 删除购物车商品
export const removeFromCart = (id: number) => {
  return request.delete(`/cart/${id}`)
}

// 清空购物车
export const clearCart = () => {
  return request.delete('/cart')
}
