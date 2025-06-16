<template>
  <va-card class="product-card" hover @click="goToDetail">
    <va-card-content class="product-image-container">
      <img
        :src="product.primary_image || 'https://via.placeholder.com/300x300?text=No+Image'"
        :alt="product.name"
        class="product-image"
      />
      <div
        v-if="product.original_price && Number(product.original_price) > Number(product.price)"
        class="discount-badge"
      >
        {{ Math.round((1 - Number(product.price) / Number(product.original_price)) * 100) }}% OFF
      </div>
    </va-card-content>

    <va-card-content class="product-info">
      <h3 class="product-name" :title="product.name">
        {{ product.name }}
      </h3>
      <div class="product-rating">
        <va-rating :model-value="Number(product.rating)" readonly size="small" color="warning" />
        <span class="rating-count">({{ product.rating_count }})</span>
      </div>

      <div class="product-price">
        <span class="current-price">¥{{ formatPrice(product.price) }}</span>
        <span
          v-if="product.original_price && Number(product.original_price) > Number(product.price)"
          class="original-price"
        >
          ¥{{ formatPrice(product.original_price) }}
        </span>
      </div>

      <div class="product-stats">
        <span class="sales-count">已售 {{ product.sales }}</span>
        <span class="stock-count">库存 {{ product.stock }}</span>
      </div>

      <div class="product-actions">
        <va-button size="small" outline @click.stop="addToCart" :disabled="product.stock === 0">
          <va-icon name="shopping_cart" size="small" />
          加入购物车
        </va-button>
        <va-button
          size="small"
          color="primary"
          @click.stop="buyNow"
          :disabled="product.stock === 0"
        >
          立即购买
        </va-button>
      </div>
    </va-card-content>
  </va-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import type { Product } from '@/api/product'

interface Props {
  product: Product
}

const props = defineProps<Props>()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

// 格式化价格，确保始终显示为数字
const formatPrice = (price: number | string): string => {
  const numPrice = Number(price)
  if (isNaN(numPrice)) {
    return '0.00'
  }
  return numPrice.toFixed(2)
}

const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const addToCart = () => {
  cartStore.addToCart(props.product, 1)
  // 可以添加一个提示
}

const buyNow = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  // 添加到购物车并跳转到结算页面
  cartStore.addToCart(props.product, 1)
  router.push('/checkout')
}
</script>

<style scoped>
.product-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image-container {
  position: relative;
  padding: 0;
  height: 250px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(45deg, #ff6b6b, #ff5252);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  color: var(--va-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.rating-count {
  font-size: 0.9rem;
  color: var(--va-text-secondary);
}

.product-price {
  margin-bottom: 0.75rem;
}

.current-price {
  font-size: 1.3rem;
  font-weight: bold;
  color: #e53e3e;
}

.original-price {
  font-size: 1rem;
  color: var(--va-text-secondary);
  text-decoration: line-through;
  margin-left: 0.5rem;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--va-text-secondary);
  margin-bottom: 1rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.product-actions .va-button {
  flex: 1;
}

@media (max-width: 768px) {
  .product-image-container {
    height: 200px;
  }

  .product-name {
    font-size: 1rem;
  }

  .current-price {
    font-size: 1.2rem;
  }

  .product-actions {
    flex-direction: column;
  }
}
</style>
