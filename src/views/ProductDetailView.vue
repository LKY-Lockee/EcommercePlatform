<template>
  <div class="product-detail-view">
    <div class="container">
      <div v-if="loading" class="loading-container">
        <va-progress-circle indeterminate />
        <p>加载中...</p>
      </div>

      <div v-else-if="!product" class="not-found">
        <h2>商品不存在</h2>
        <va-button @click="$router.push('/products')"> 返回商品列表 </va-button>
      </div>

      <div v-else class="product-detail">
        <div class="product-content">
          <!-- 商品图片 -->
          <div class="product-images">
            <div class="main-image">
              <img :src="product.image" :alt="product.name" class="main-img" />
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>

            <div class="product-rating">
              <va-rating :model-value="Number(product.rating)" readonly color="warning" />
              <span class="rating-text">
                {{ Number(product.rating).toFixed(1) }} ({{ product.rating_count }}人评价)
              </span>
            </div>

            <div class="product-price">
              <span class="current-price">¥{{ formatPrice(product.price) }}</span>
              <span
                v-if="
                  product.original_price && Number(product.original_price) > Number(product.price)
                "
                class="original-price"
              >
                ¥{{ formatPrice(product.original_price) }}
              </span>
              <span
                v-if="
                  product.original_price && Number(product.original_price) > Number(product.price)
                "
                class="discount-badge"
              >
                {{
                  Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)
                }}% OFF
              </span>
            </div>

            <div class="product-stats">
              <div class="stat-item">
                <span class="stat-label">销量：</span>
                <span class="stat-value">{{ product.sales }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">库存：</span>
                <span class="stat-value">{{ product.stock }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">品牌：</span>
                <span class="stat-value">{{ product.brand || '暂无' }}</span>
              </div>
            </div>

            <div class="product-description">
              <h3>商品描述</h3>
              <p>{{ product.description }}</p>
            </div>

            <div class="purchase-section">
              <div class="quantity-selector">
                <span class="quantity-label">数量：</span>
                <va-counter v-model="quantity" :min="1" :max="product.stock" />
              </div>

              <div class="action-buttons">
                <va-button
                  size="large"
                  outline
                  @click="addToCart"
                  :disabled="product.stock === 0"
                  class="add-cart-btn"
                >
                  <va-icon name="shopping_cart" />
                  加入购物车
                </va-button>

                <va-button
                  size="large"
                  color="primary"
                  @click="buyNow"
                  :disabled="product.stock === 0"
                  class="buy-now-btn"
                >
                  立即购买
                </va-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '@/api/product'
import type { Product } from '@/types'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const product = ref<Product | null>(null)
const loading = ref(false)
const quantity = ref(1)

const formatPrice = (price: number | string): string => {
  const numPrice = Number(price)
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
}

const loadProduct = async () => {
  loading.value = true
  try {
    const productId = Number(route.params.id)
    const response = await getProductDetail(productId)
    product.value = response.data
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

const addToCart = async () => {
  if (!product.value) return
  try {
    await cartStore.addToCart(product.value, quantity.value)
  } catch {
    // 错误处理可在这里添加用户提示
  }
}

const buyNow = async () => {
  if (!product.value) return

  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  try {
    await cartStore.addToCart(product.value, quantity.value)
    router.push('/checkout')
  } catch {
    // 错误处理可在这里添加用户提示
  }
}

onMounted(loadProduct)
</script>

<style scoped>
.product-detail-view {
  min-height: 100vh;
  padding: 2rem 0;
  background-color: var(--va-background-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.not-found {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
}

.breadcrumbs {
  margin-bottom: 2rem;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
}

.product-images {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  flex: 1;
}

.main-img {
  width: 100%;
  height: 500px;
  object-fit: cover;
  border-radius: 8px;
}

.thumbnail-list {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
}

.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.thumbnail:hover,
.thumbnail.active {
  border-color: var(--va-primary);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  color: var(--va-text-primary);
  line-height: 1.3;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-text {
  color: var(--va-text-secondary);
}

.product-price {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.current-price {
  font-size: 2rem;
  font-weight: bold;
  color: #e53e3e;
}

.original-price {
  font-size: 1.2rem;
  color: var(--va-text-secondary);
  text-decoration: line-through;
}

.discount-badge {
  background: linear-gradient(45deg, #ff6b6b, #ff5252);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: bold;
}

.product-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.stat-item {
  display: flex;
  gap: 0.5rem;
}

.stat-label {
  color: var(--va-text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--va-text-primary);
}

.product-description h3 {
  margin: 0 0 0.5rem 0;
  color: var(--va-text-primary);
}

.product-description p {
  line-height: 1.6;
  color: var(--va-text-secondary);
  margin: 0;
}

.purchase-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--va-background-border);
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-label {
  font-weight: 600;
  color: var(--va-text-primary);
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.add-cart-btn,
.buy-now-btn {
  flex: 1;
}

@media (max-width: 768px) {
  .product-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1rem;
  }

  .main-img {
    height: 300px;
  }

  .product-title {
    font-size: 1.5rem;
  }

  .current-price {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
