<template>
  <div class="cart-view">
    <div class="container">
      <h1 class="page-title">购物车</h1>

      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <va-icon name="shopping_cart" size="4rem" color="secondary" />
        <h2>购物车为空</h2>
        <p>去逛逛商品，挑选你喜欢的物品吧</p>
        <va-button @click="$router.push('/products')"> 开始购物 </va-button>
      </div>

      <div v-else>
        <va-card>
          <va-card-content>
            <!-- 购物车头部 -->
            <div class="cart-header">
              <va-checkbox
                :model-value="allSelected"
                @update:model-value="cartStore.toggleSelectAll"
              >
                全选
              </va-checkbox>
              <span class="item-count">共 {{ cartStore.totalItems }} 件商品</span>
              <va-button
                flat
                color="danger"
                @click="handleClearSelected"
                :disabled="cartStore.selectedItems.length === 0"
              >
                删除选中
              </va-button>
            </div>

            <va-divider />

            <!-- 购物车商品列表 -->
            <div class="cart-items">
              <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
                <va-checkbox
                  :model-value="item.selected"
                  @update:model-value="cartStore.toggleSelected(item.id)"
                />

                <div class="item-image">
                  <img
                    :src="item.product.primary_image || 'https://via.placeholder.com/100x100'"
                    :alt="item.product.name"
                  />
                </div>

                <div class="item-info">
                  <h3 class="item-name">{{ item.product.name }}</h3>
                  <p class="item-description">{{ item.product.description }}</p>
                  <div class="item-price">
                    <span class="current-price">¥{{ item.product.price.toFixed(2) }}</span>
                    <span
                      v-if="
                        item.product.original_price &&
                        item.product.original_price > item.product.price
                      "
                      class="original-price"
                    >
                      ¥{{ item.product.original_price.toFixed(2) }}
                    </span>
                  </div>
                </div>

                <div class="item-quantity">
                  <va-counter
                    :model-value="item.quantity"
                    :min="1"
                    :max="item.product.stock"
                    @update:model-value="(value) => cartStore.updateQuantity(item.id, value)"
                  />
                  <span class="stock-info">库存: {{ item.product.stock }}</span>
                </div>

                <div class="item-total">
                  <span class="total-price">
                    ¥{{ (item.product.price * item.quantity).toFixed(2) }}
                  </span>
                </div>

                <div class="item-actions">
                  <va-button
                    flat
                    icon="delete"
                    color="danger"
                    @click="cartStore.removeFromCart(item.id)"
                  />
                </div>
              </div>
            </div>

            <va-divider />

            <!-- 购物车底部 -->
            <div class="cart-footer">
              <div class="price-summary">
                <div class="price-row">
                  <span>商品总价：</span>
                  <span>¥{{ cartStore.totalOriginalAmount.toFixed(2) }}</span>
                </div>
                <div v-if="cartStore.totalDiscount > 0" class="price-row discount">
                  <span>优惠金额：</span>
                  <span>-¥{{ cartStore.totalDiscount.toFixed(2) }}</span>
                </div>
                <div class="price-row total">
                  <span>应付总额：</span>
                  <span class="total-amount">¥{{ cartStore.totalAmount.toFixed(2) }}</span>
                </div>
              </div>

              <div class="checkout-actions">
                <va-button
                  size="large"
                  color="primary"
                  @click="handleCheckout"
                  :disabled="cartStore.selectedItems.length === 0"
                >
                  结算 ({{ cartStore.selectedItems.length }})
                </va-button>
              </div>
            </div>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const allSelected = computed(
  () => cartStore.items.length > 0 && cartStore.items.every((item) => item.selected),
)

const handleClearSelected = () => {
  cartStore.clearSelected()
}

const handleCheckout = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (cartStore.selectedItems.length === 0) {
    return
  }

  router.push('/checkout')
}
</script>

<style scoped>
.cart-view {
  min-height: 100vh;
  padding: 2rem 0;
  background-color: var(--va-background-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: var(--va-text-primary);
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
}

.empty-cart h2 {
  margin: 1rem 0 0.5rem 0;
  color: var(--va-text-primary);
}

.empty-cart p {
  color: var(--va-text-secondary);
  margin-bottom: 2rem;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.item-count {
  color: var(--va-text-secondary);
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--va-background-primary);
  border-radius: 8px;
  border: 1px solid var(--va-background-border);
}

.item-image {
  flex-shrink: 0;
}

.item-image img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--va-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-description {
  color: var(--va-text-secondary);
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-price {
  font-size: 1.1rem;
  font-weight: bold;
  color: #e53e3e;
}

.original-price {
  font-size: 0.9rem;
  color: var(--va-text-secondary);
  text-decoration: line-through;
}

.item-quantity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stock-info {
  font-size: 0.8rem;
  color: var(--va-text-secondary);
}

.item-total {
  flex-shrink: 0;
  min-width: 100px;
  text-align: right;
}

.total-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--va-text-primary);
}

.item-actions {
  flex-shrink: 0;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 1rem 0 0 0;
}

.price-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  min-width: 200px;
}

.price-row.discount {
  color: #e53e3e;
}

.price-row.total {
  font-size: 1.2rem;
  font-weight: bold;
  border-top: 1px solid var(--va-background-border);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.total-amount {
  color: #e53e3e;
}

.checkout-actions {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .item-info {
    order: -1;
  }

  .cart-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .price-summary {
    order: 1;
  }

  .checkout-actions {
    justify-content: center;
  }
}
</style>
