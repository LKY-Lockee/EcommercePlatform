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
        <va-button size="medium" outline @click.stop="addToCart" :disabled="product.stock === 0">
          <va-icon name="shopping_cart" size="small" />
          加入购物车
        </va-button>
        <va-button
          size="medium"
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

const formatPrice = (price: number | string): string => {
  const numPrice = Number(price)
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
}

const goToDetail = () => router.push(`/product/${props.product.id}`)

const addToCart = () => cartStore.addToCart(props.product, 1)

const buyNow = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  cartStore.addToCart(props.product, 1)
  router.push('/checkout')
}
</script>

<style scoped>
.product-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.product-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
  border-color: var(--va-primary);
}

.product-image-container {
  position: relative;
  padding: 0;
  height: 260px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .product-image {
  transform: scale(1.08);
  filter: brightness(1.05);
}

.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  backdrop-filter: blur(10px);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  line-height: 1.4;
  color: var(--va-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
  min-height: 2.8rem;
}

.product-card:hover .product-name {
  color: var(--va-primary);
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.rating-count {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  font-weight: 500;
}

.product-price {
  margin-bottom: 12px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.current-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e53e3e;
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.original-price {
  font-size: 1rem;
  color: var(--va-text-secondary);
  text-decoration: line-through;
  font-weight: 500;
  opacity: 0.7;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  margin-bottom: 16px;
  padding: 8px 12px;
  background: rgba(var(--va-primary-rgb), 0.05);
  border-radius: 8px;
  border: 1px solid rgba(var(--va-primary-rgb), 0.1);
}

.sales-count,
.stock-count {
  font-weight: 500;
}

.product-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.product-actions .va-button {
  flex: 1;
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-actions .va-button:first-child {
  background: transparent;
  color: var(--va-primary);
}

.product-actions .va-button:first-child:hover {
  background: var(--va-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--va-primary-rgb), 0.3);
}

.product-actions .va-button:last-child {
  background: linear-gradient(135deg, var(--va-primary) 0%, var(--va-primary-dark) 100%);
  border: none;
  color: white;
}

.product-actions .va-button:last-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--va-primary-rgb), 0.4);
}

.product-actions .va-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 库存不足时的样式 */
.product-card:has(.va-button:disabled)::after {
  content: '暂时缺货';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.product-card:has(.va-button:disabled) {
  position: relative;
}

.product-card:has(.va-button:disabled) .product-image {
  filter: grayscale(50%) brightness(0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-image-container {
    height: 220px;
  }

  .product-info {
    padding: 16px;
  }

  .product-name {
    font-size: 1rem;
    min-height: 2.4rem;
  }

  .current-price {
    font-size: 1.25rem;
  }

  .product-actions {
    flex-direction: column;
    gap: 8px;
  }

  .product-stats {
    font-size: 0.8rem;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .product-image-container {
    height: 200px;
  }

  .product-info {
    padding: 12px;
  }

  .current-price {
    font-size: 1.125rem;
  }

  .discount-badge {
    top: 8px;
    left: 8px;
    padding: 4px 8px;
    font-size: 0.7rem;
  }
}

/* 加载动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-card {
  animation: fadeInUp 0.6s ease-out;
}

/* 悬停时的微动画 */
.product-card:hover .discount-badge {
  animation-play-state: paused;
  transform: scale(1.1);
}

.product-card:hover .product-stats {
  background: rgba(var(--va-primary-rgb), 0.1);
  border-color: rgba(var(--va-primary-rgb), 0.2);
}
</style>
