import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem , Product } from '@/types'
import {
  getCart as getCartAPI,
  addToCart as addToCartAPI,
  updateCartItem as updateCartItemAPI,
  removeFromCart as removeFromCartAPI,
  clearCart as clearCartAPI,
} from '@/api/cart'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore()
  const items = ref<CartItem[]>([])

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const totalAmount = computed(() =>
    items.value.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
  )

  const totalOriginalAmount = computed(() =>
    items.value.reduce(
      (sum, item) =>
        sum + Number(item.original_price || item.price) * item.quantity,
      0,
    ),
  )

  const totalDiscount = computed(() => totalOriginalAmount.value - totalAmount.value)

  // 获取购物车数据
  const getCart = async () => {
    if (!userStore.isLoggedIn) {
      return
    }

    try {
      const response = await getCartAPI()

      const cartData = response.data
      if (Array.isArray(cartData)) {
        items.value = cartData.map((item) => ({ ...item, selected: true }))
      } else {
        items.value = []
      }
    } catch (error) {
      console.error('获取购物车失败:', error)
    }
  }

  // 添加商品到购物车
  const addToCart = async (product: Product, quantity = 1) => {
    if (!userStore.isLoggedIn) {
      return
    }

    try {
      const data = { product_id: product.id, quantity }
      await addToCartAPI(data)
      await getCart()
    } catch (error) {
      console.error('添加到购物车失败:', error)
      throw error
    }
  }

  // 更新商品数量
  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!userStore.isLoggedIn) {
      return
    }

    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    const item = items.value.find((item) => item.id === itemId)
    if (!item) return

    try {
      await updateCartItemAPI(itemId, quantity)
      await getCart()
    } catch (error) {
      console.error('更新商品数量失败:', error)
      throw error
    }
  }

  // 移除商品
  const removeFromCart = async (itemId: number) => {
    if (!userStore.isLoggedIn) {
      return
    }

    try {
      await removeFromCartAPI(itemId)
      await getCart()
    } catch (error) {
      console.error('移除商品失败:', error)
      throw error
    }
  }

  // 清空购物车
  const clearCart = async () => {
    if (!userStore.isLoggedIn) {
      return
    }

    try {
      await clearCartAPI()
      items.value = []
    } catch (error) {
      console.error('清空购物车失败:', error)
      throw error
    }
  }

  // 清空选中的商品
  const clearSelected = async () => {
    if (!userStore.isLoggedIn) {
      return
    }

    const selectedItemIds = items.value.map((item) => item.id)

    try {
      for (const itemId of selectedItemIds) {
        await removeFromCartAPI(itemId)
      }
      await getCart()
    } catch (error) {
      console.error('清空选中商品失败:', error)
      throw error
    }
  }

  return {
    items,
    totalItems,
    selectedItems: items,
    totalAmount,
    totalOriginalAmount,
    totalDiscount,
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearSelected,
  }
})
