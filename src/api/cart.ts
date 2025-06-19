import request from './index'
import type { CartItem, CartItemData } from '@/types'

// ===== 购物车管理 =====

// 获取购物车列表
export const getCart = () => request.get<CartItem[]>('/cart')

// 添加商品到购物车
export const addToCart = (data: CartItemData) => request.post<CartItem>('/cart', data)

// 更新购物车商品数量
export const updateCartItem = (id: number, quantity: number) =>
  request.put<CartItem>(`/cart/${id}`, { quantity })

// 删除购物车商品
export const removeFromCart = (id: number) =>
  request.delete<{ message: string }>(`/cart/${id}`)

// 清空购物车
export const clearCart = () => request.delete<{ message: string }>('/cart')
