import request from './index'
import type { CartItem, CartItemData, ApiResponse } from '@/types'

// ===== 购物车管理 =====

// 获取购物车列表
export const getCart = () => request.get<ApiResponse<CartItem[]>>('/cart')

// 添加商品到购物车
export const addToCart = (data: CartItemData) => request.post<ApiResponse<CartItem>>('/cart', data)

// 更新购物车商品数量
export const updateCartItem = (id: number, quantity: number) =>
  request.put<ApiResponse<CartItem>>(`/cart/${id}`, { quantity })

// 删除购物车商品
export const removeFromCart = (id: number) =>
  request.delete<ApiResponse<{ message: string }>>(`/cart/${id}`)

// 批量删除购物车商品
export const removeCartItems = (ids: number[]) =>
  request.post<ApiResponse<{ message: string }>>('/cart/batch-remove', { ids })

// 清空购物车
export const clearCart = () => request.delete<ApiResponse<{ message: string }>>('/cart')

// 选中/取消选中购物车商品
export const toggleCartItemSelected = (id: number, selected: boolean) =>
  request.put<ApiResponse<CartItem>>(`/cart/${id}/selected`, { selected })

// 批量选中/取消选中
export const toggleCartItemsSelected = (ids: number[], selected: boolean) =>
  request.post<ApiResponse<{ message: string }>>('/cart/batch-selected', { ids, selected })

// 全选/全不选
export const toggleAllCartItems = (selected: boolean) =>
  request.put<ApiResponse<{ message: string }>>('/cart/select-all', { selected })
