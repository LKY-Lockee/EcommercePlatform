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

      <div v-else-if="orders.length === 0" class="empty-state">
        <va-icon name="receipt_long" size="3rem" color="secondary" />
        <h3>暂无订单</h3>
        <p>快去选购您喜欢的商品吧</p>
        <va-button @click="$router.push('/products')">开始购物</va-button>
      </div>

      <va-card v-else v-for="order in orders" :key="order.id" class="order-card">
        <va-card-content>
          <!-- 订单头部 -->
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单号：{{ order.orderNumber }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <va-chip :color="getStatusColor(order.status)" :text="getStatusText(order.status)" />
          </div>

          <va-divider />

          <!-- 订单商品 -->
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <img
                :src="item.productImage || 'https://via.placeholder.com/80x80'"
                :alt="item.productName"
                class="item-image"
              />
              <div class="item-info">
                <h4 class="item-name">{{ item.productName }}</h4>
                <p class="item-price">¥{{ item.productPrice.toFixed(2) }} x {{ item.quantity }}</p>
              </div>
              <div class="item-total">¥{{ item.subtotal.toFixed(2) }}</div>
            </div>
          </div>

          <va-divider />

          <!-- 订单底部 -->
          <div class="order-footer">
            <div class="order-total">
              <span class="total-label">订单总额：</span>
              <span class="total-amount">¥{{ order.totalAmount.toFixed(2) }}</span>
            </div>

            <div class="order-actions">
              <va-button v-if="order.status === 'pending'" size="small" @click="payOrder(order)">
                立即付款
              </va-button>
              <va-button
                v-if="order.status === 'shipped'"
                size="small"
                @click="confirmOrder(order)"
              >
                确认收货
              </va-button>
              <va-button
                v-if="order.status === 'pending'"
                size="small"
                flat
                color="danger"
                @click="cancelOrder(order)"
              >
                取消订单
              </va-button>
              <va-button size="small" flat @click="viewOrderDetail(order)">查看详情</va-button>
            </div>
          </div>
        </va-card-content>
      </va-card>
    </div>

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
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface OrderItem {
  id: number
  productName: string
  productImage: string
  productPrice: number
  quantity: number
  subtotal: number
}

interface Order {
  id: number
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

const activeTab = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

// 模拟订单数据
const orders = ref([
  {
    id: 1,
    orderNumber: 'ORD20240616001',
    status: 'pending',
    totalAmount: 2999.0,
    createdAt: '2024-06-16T10:30:00',
    items: [
      {
        id: 1,
        productName: 'Apple iPhone 15 Pro Max',
        productImage: 'https://via.placeholder.com/80x80?text=iPhone',
        productPrice: 2999.0,
        quantity: 1,
        subtotal: 2999.0,
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD20240615002',
    status: 'shipped',
    totalAmount: 1499.0,
    createdAt: '2024-06-15T14:20:00',
    items: [
      {
        id: 2,
        productName: 'Nike Air Jordan 1',
        productImage: 'https://via.placeholder.com/80x80?text=Jordan',
        productPrice: 1299.0,
        quantity: 1,
        subtotal: 1299.0,
      },
      {
        id: 3,
        productName: '李宁运动套装',
        productImage: 'https://via.placeholder.com/80x80?text=LiNing',
        productPrice: 399.0,
        quantity: 1,
        subtotal: 399.0,
      },
    ],
  },
])

const statusMap = {
  pending: { text: '待付款', color: 'warning' },
  paid: { text: '待发货', color: 'info' },
  shipped: { text: '待收货', color: 'primary' },
  delivered: { text: '已完成', color: 'success' },
  cancelled: { text: '已取消', color: 'danger' },
}

const getStatusText = (status: string) => {
  return statusMap[status as keyof typeof statusMap]?.text || status
}

const getStatusColor = (status: string) => {
  return statusMap[status as keyof typeof statusMap]?.color || 'secondary'
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleString('zh-CN')

const loadOrders = () => {
  loading.value = true
  setTimeout(() => (loading.value = false), 1000)
}

const payOrder = (order: Order) => {
  console.log('支付订单:', order.id)
}

const confirmOrder = (order: Order) => {
  console.log('确认收货:', order.id)
  order.status = 'delivered'
}

const cancelOrder = (order: Order) => {
  console.log('取消订单:', order.id)
  order.status = 'cancelled'
}

const viewOrderDetail = (order: Order) => {
  console.log('查看订单详情:', order.id)
}

watch(activeTab, () => {
  loadOrders()
})

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

.total-label {
  color: var(--va-text-secondary);
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
