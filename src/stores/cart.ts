import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/api/product'

export interface CartItem {
  id: number
  product: Product
  quantity: number
  selected: boolean
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const selectedItems = computed(() => items.value.filter((item) => item.selected))

  const totalAmount = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
  )

  const totalOriginalAmount = computed(() =>
    selectedItems.value.reduce(
      (sum, item) =>
        sum + Number(item.product.original_price || item.product.price) * item.quantity,
      0,
    ),
  )

  const totalDiscount = computed(() => totalOriginalAmount.value - totalAmount.value)

  // 添加商品到购物车
  const addToCart = (product: Product, quantity = 1) => {
    const existingItem = items.value.find((item) => item.product.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        id: Date.now(),
        product,
        quantity,
        selected: true,
      })
    }

    saveToLocalStorage()
  }

  // 更新商品数量
  const updateQuantity = (itemId: number, quantity: number) => {
    const item = items.value.find((item) => item.id === itemId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(itemId)
      } else {
        item.quantity = quantity
        saveToLocalStorage()
      }
    }
  }

  // 移除商品
  const removeFromCart = (itemId: number) => {
    const index = items.value.findIndex((item) => item.id === itemId)
    if (index > -1) {
      items.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  // 切换选中状态
  const toggleSelected = (itemId: number) => {
    const item = items.value.find((item) => item.id === itemId)
    if (item) {
      item.selected = !item.selected
      saveToLocalStorage()
    }
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    const allSelected = items.value.every((item) => item.selected)
    items.value.forEach((item) => {
      item.selected = !allSelected
    })
    saveToLocalStorage()
  }

  // 清空购物车
  const clearCart = () => {
    items.value = []
    saveToLocalStorage()
  }

  // 清空选中的商品
  const clearSelected = () => {
    items.value = items.value.filter((item) => !item.selected)
    saveToLocalStorage()
  }

  // 保存到本地存储
  const saveToLocalStorage = () => {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  // 从本地存储加载
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        items.value = JSON.parse(saved)
      } catch (error) {
        console.error('解析购物车数据失败:', error)
        clearCart()
      }
    }
  }

  return {
    items,
    totalItems,
    selectedItems,
    totalAmount,
    totalOriginalAmount,
    totalDiscount,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleSelected,
    toggleSelectAll,
    clearCart,
    clearSelected,
    loadFromLocalStorage,
  }
})
