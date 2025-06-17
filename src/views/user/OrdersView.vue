<template>
  <div class="orders-view">
    <h2 class="page-title">我的订单</h2>

    <!-- 订单状态筛选 -->
    <div class="order-tabs">
      <va-tabs v-model="activeTab">
        <va-tab label="全部订单" />
        <va-tab label="待付款" />
        <va-tab label="待发货" />
        <va-tab label="待收货" />
        <va-tab label="已完成" />
        <va-tab label="已取消" />
      </va-tabs>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list">
      <div v-if="loading" class="loading-state">
        <va-progress-circle indeterminate />
        <p>加载中...</p>
      </div>

      <div v-else-if="filteredOrders.length === 0" class="empty-state">
        <va-icon name="receipt_long" size="3rem" color="secondary" />
        <h3>暂无订单</h3>
        <p>快去选购您喜欢的商品吧</p>
        <va-button @click="$router.push('/products')">开始购物</va-button>
      </div>

      <va-card v-else v-for="order in filteredOrders" :key="order.id" class="order-card">
        <va-card-content>
          <!-- 订单头部 -->
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单号：{{ order.order_number }}</span>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>
            <va-chip :color="getStatusColor(order.status)" :text="getStatusText(order.status)" />
          </div>

          <va-divider />

          <!-- 订单商品 -->
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <img
                :src="getProductImage(item.product_id) || 'https://via.placeholder.com/80x80'"
                :alt="item.product_name"
                class="item-image"
              />
              <div class="item-info">
                <h4 class="item-name">{{ item.product_name }}</h4>
                <div class="item-price">¥{{ formatPrice(item.product_price) }}</div>
                <div class="item-quantity">数量：{{ item.quantity }}</div>
              </div>
              <div class="item-total">¥{{ formatPrice(item.subtotal) }}</div>
            </div>
          </div>

          <va-divider />

          <!-- 订单底部 -->
          <div class="order-footer">
            <div class="order-total">
              总计：<span class="total-amount">¥{{ formatPrice(order.total_amount) }}</span>
            </div>
            <div class="order-actions">
              <va-button
                v-if="order.status === 'pending'"
                size="small"
                :loading="actionLoading === order.id"
                @click="handlePayOrder(order)"
              >
                立即付款
              </va-button>
              <va-button
                v-if="order.status === 'shipped'"
                size="small"
                :loading="actionLoading === order.id"
                @click="handleConfirmOrder(order)"
              >
                确认收货
              </va-button>
              <va-button
                v-if="order.status === 'pending'"
                flat
                size="small"
                color="danger"
                :loading="actionLoading === order.id"
                @click="handleCancelOrder(order)"
              >
                取消订单
              </va-button>
            </div>
          </div>
        </va-card-content>
      </va-card>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination-container">
        <va-pagination
          v-model="currentPage"
          :pages="totalPages"
          :visible-pages="5"
          @update:model-value="loadOrders"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  getOrders,
  cancelOrder as cancelOrderAPI,
  payOrder as payOrderAPI,
  confirmOrder as confirmOrderAPI,
  type Order,
} from '@/api/order'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

const activeTab = ref(0)
const loading = ref(false)
const actionLoading = ref<number | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const orders = ref<Order[]>([])

// 订单状态映射
const statusMap = ['', 'pending', 'paid', 'shipped', 'delivered', 'cancelled']

const statusDisplayMap = {
  pending: { text: '待付款', color: 'warning' },
  paid: { text: '待发货', color: 'info' },
  shipped: { text: '待收货', color: 'primary' },
  delivered: { text: '已完成', color: 'success' },
  cancelled: { text: '已取消', color: 'danger' },
}

// 根据选中的标签过滤订单
const filteredOrders = computed(() => {
  const targetStatus = statusMap[activeTab.value]
  return targetStatus ? orders.value.filter((order) => order.status === targetStatus) : orders.value
})

// 加载订单列表
const loadOrders = async (page = 1) => {
  loading.value = true
  try {
    const response = await getOrders()
    orders.value = response.data || []
    currentPage.value = page
    totalPages.value = 1
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
}

const getStatusText = (status: string) => {
  return statusDisplayMap[status as keyof typeof statusDisplayMap]?.text || status
}

const getStatusColor = (status: string) => {
  return statusDisplayMap[status as keyof typeof statusDisplayMap]?.color || 'secondary'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatPrice = (price: number | string) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
}

const getProductImage = (productId: number) => {
  return `https://via.placeholder.com/80x80?text=Product${productId}`
}

const updateOrderStatus = (orderId: number, status: Order['status']) => {
  const orderIndex = orders.value.findIndex((o) => o.id === orderId)
  if (orderIndex > -1) {
    orders.value[orderIndex].status = status
  }
}

const handlePayOrder = async (order: Order) => {
  try {
    actionLoading.value = order.id
    await payOrderAPI(order.id)
    await cartStore.fetchCart()
    updateOrderStatus(order.id, 'paid')
  } catch {
    // Error handled by API layer
  } finally {
    actionLoading.value = null
  }
}

const handleConfirmOrder = async (order: Order) => {
  try {
    actionLoading.value = order.id
    await confirmOrderAPI(order.id)
    updateOrderStatus(order.id, 'delivered')
  } catch {
    // Error handled by API layer
  } finally {
    actionLoading.value = null
  }
}

const handleCancelOrder = async (order: Order) => {
  try {
    actionLoading.value = order.id
    await cancelOrderAPI(order.id)
    updateOrderStatus(order.id, 'cancelled')
  } catch {
    // Error handled by API layer
  } finally {
    actionLoading.value = null
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-view {
  max-width: 1000px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--va-text-primary);
}

.order-tabs {
  margin-bottom: 2rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: var(--va-text-primary);
}

.empty-state p {
  color: var(--va-text-secondary);
  margin-bottom: 2rem;
}

.order-card {
  transition: box-shadow 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-number {
  font-weight: 600;
  color: var(--va-text-primary);
}

.order-date {
  font-size: 0.9rem;
  color: var(--va-text-secondary);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--va-border-radius);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--va-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  color: var(--va-text-secondary);
  margin: 0;
  padding-bottom: 10px;
}

.item-total {
  font-weight: 600;
  color: var(--va-text-primary);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.order-total {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.total-amount {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e53e3e;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .order-item {
    flex-direction: column;
    text-align: center;
  }

  .order-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .order-actions {
    justify-content: center;
  }
}
</style>
