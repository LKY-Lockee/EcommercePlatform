import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/api/product'
import { cartAPI } from '@/api/cart'
import { useUserStore } from './user'

export interface CartItem {
  id: number
  product: Product
  quantity: number
  selected: boolean
}

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore()
  const items = ref<CartItem[]>([])
  const loading = ref(false)

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

  // 获取购物车数据
  const fetchCart = async () => {
    console.log('fetchCart called, isLoggedIn:', userStore.isLoggedIn)

    if (!userStore.isLoggedIn) {
      loadFromLocalStorage()
      return
    }

    loading.value = true
    try {
      console.log('请求购物车数据...')
      const response = await cartAPI.getCart()
      console.log('购物车API响应:', response.data)

      // 将服务端数据转换为本地格式
      items.value = response.data.map((item) => ({
        id: item.id,
        product: {
          id: item.product_id,
          name: item.name,
          description: '', // 购物车API没有返回描述，先设为空
          price: item.price,
          original_price: item.price, // 如果没有原价，使用当前价格
          stock: item.stock,
          category_id: 0, // 购物车API没有返回分类，先设为0
          status: 'active',
          featured: false,
          views: 0,
          sales: 0,
          rating: 0,
          rating_count: 0,
          primary_image: item.image_url,
          created_at: new Date().toISOString(),
        } as Product,
        quantity: item.quantity,
        selected: true,
      }))
      console.log('购物车数据已更新:', items.value)
    } catch (error) {
      console.error('获取购物车失败:', error)
      loadFromLocalStorage()
    } finally {
      loading.value = false
    }
  }

  // 添加商品到购物车
  const addToCart = async (product: Product, quantity = 1) => {
    console.log('addToCart called:', {
      product: product.name,
      quantity,
      isLoggedIn: userStore.isLoggedIn,
    })

    if (!userStore.isLoggedIn) {
      // 未登录时使用本地存储
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
      console.log('已添加到本地购物车')
      return
    }

    try {
      console.log('发送API请求:', { product_id: product.id, quantity })
      const response = await cartAPI.addToCart({ product_id: product.id, quantity })
      console.log('API响应:', response)
      await fetchCart()
      console.log('购物车已更新')
    } catch (error) {
      console.error('添加到购物车失败:', error)
      throw error
    }
  }

  // 更新商品数量
  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    const item = items.value.find((item) => item.id === itemId)
    if (!item) return

    if (!userStore.isLoggedIn) {
      // 未登录时使用本地存储
      item.quantity = quantity
      saveToLocalStorage()
      return
    }

    try {
      await cartAPI.updateCartItem(itemId, quantity)
      await fetchCart()
    } catch (error) {
      console.error('更新商品数量失败:', error)
      throw error
    }
  }

  // 移除商品
  const removeFromCart = async (itemId: number) => {
    if (!userStore.isLoggedIn) {
      // 未登录时使用本地存储
      const index = items.value.findIndex((item) => item.id === itemId)
      if (index > -1) {
        items.value.splice(index, 1)
        saveToLocalStorage()
      }
      return
    }

    try {
      await cartAPI.removeFromCart(itemId)
      await fetchCart()
    } catch (error) {
      console.error('移除商品失败:', error)
      throw error
    }
  }

  // 切换选中状态（仅本地存储，服务端不需要保存选中状态）
  const toggleSelected = (itemId: number) => {
    const item = items.value.find((item) => item.id === itemId)
    if (item) {
      item.selected = !item.selected
      if (!userStore.isLoggedIn) {
        saveToLocalStorage()
      }
    }
  }

  // 全选/取消全选（仅本地存储）
  const toggleSelectAll = () => {
    const allSelected = items.value.every((item) => item.selected)
    items.value.forEach((item) => {
      item.selected = !allSelected
    })
    if (!userStore.isLoggedIn) {
      saveToLocalStorage()
    }
  }

  // 清空购物车
  const clearCart = async () => {
    if (!userStore.isLoggedIn) {
      // 未登录时使用本地存储
      items.value = []
      saveToLocalStorage()
      return
    }

    try {
      await cartAPI.clearCart()
      items.value = []
    } catch (error) {
      console.error('清空购物车失败:', error)
      throw error
    }
  }

  // 清空选中的商品
  const clearSelected = async () => {
    const selectedItemIds = selectedItems.value.map((item) => item.id)

    if (!userStore.isLoggedIn) {
      // 未登录时使用本地存储
      items.value = items.value.filter((item) => !item.selected)
      saveToLocalStorage()
      return
    }

    try {
      // 逐个删除选中的商品
      for (const itemId of selectedItemIds) {
        await cartAPI.removeFromCart(itemId)
      }
      await fetchCart()
    } catch (error) {
      console.error('清空选中商品失败:', error)
      throw error
    }
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

  // 登录后同步本地购物车到服务端
  const syncLocalCartToServer = async () => {
    if (!userStore.isLoggedIn || items.value.length === 0) {
      return
    }

    try {
      // 将本地购物车商品添加到服务端
      for (const item of items.value) {
        await cartAPI.addToCart({
          product_id: item.product.id,
          quantity: item.quantity,
        })
      }

      // 清空本地购物车并从服务端重新获取
      localStorage.removeItem('cart')
      await fetchCart()
    } catch (error) {
      console.error('同步购物车到服务端失败:', error)
      // 如果同步失败，保留本地数据
    }
  }

  return {
    items,
    loading,
    totalItems,
    selectedItems,
    totalAmount,
    totalOriginalAmount,
    totalDiscount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleSelected,
    toggleSelectAll,
    clearCart,
    clearSelected,
    loadFromLocalStorage,
    saveToLocalStorage,
    syncLocalCartToServer,
  }
})
