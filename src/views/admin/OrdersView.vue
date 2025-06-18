<template>
  <div class="admin-orders">
    <div class="page-header">
      <h2 class="page-title">订单管理</h2>
    </div>

    <!-- 搜索过滤器 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <va-input v-model="searchQuery" placeholder="搜索订单号、用户..." clearable />
        </div>
        <div class="filter-item">
          <va-select
            v-model="statusFilter"
            :options="statusOptions"
            text-by="text"
            value-by="value"
            placeholder="订单状态"
            clearable
          />
        </div>
        <div class="filter-actions">
          <va-button @click="searchOrders">搜索</va-button>
          <va-button preset="secondary" @click="resetSearch">重置</va-button>
        </div>
      </div>
    </div>

    <!-- 订单统计 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <va-icon name="receipt" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">总订单数</div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon completed">
            <va-icon name="check_circle" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon pending">
            <va-icon name="schedule" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ stats.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon cancelled">
            <va-icon name="cancel" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ stats.cancelled }}</div>
            <div class="stat-label">已取消</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-table">
      <va-data-table :items="orders" :columns="columns" :loading="loading" class="data-table">
        <template #cell(orderNumber)="{ rowData }">
          <span class="order-number">{{ rowData.orderNumber }}</span>
        </template>

        <template #cell(user)="{ rowData }">
          <div class="user-info">
            <va-avatar size="small" :src="rowData.user?.avatar" />
            <div class="user-details">
              <div class="user-name">{{ rowData.user?.name }}</div>
              <div class="user-email">{{ rowData.user?.email }}</div>
            </div>
          </div>
        </template>

        <template #cell(status)="{ rowData }">
          <span :class="`status-badge ${rowData.status}`">
            {{ getStatusText(rowData.status) }}
          </span>
        </template>

        <template #cell(total)="{ rowData }">
          <span class="order-total">¥{{ rowData.total.toFixed(2) }}</span>
        </template>

        <template #cell(actions)="{ rowData }">
          <div class="action-buttons">
            <va-button preset="plain" size="small" icon="visibility" @click="viewOrder(rowData)" />
            <va-button preset="plain" size="small" icon="edit" @click="editOrder(rowData)" />
          </div>
        </template>
      </va-data-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

interface Order {
  id: number
  orderNumber: string
  user: User
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  total: number
  createdAt: string
}

const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)

const stats = ref({
  total: 0,
  completed: 0,
  pending: 0,
  cancelled: 0,
})

const orders = ref<Order[]>([])

const statusOptions = [
  { text: '待支付', value: 'pending' },
  { text: '已支付', value: 'paid' },
  { text: '已发货', value: 'shipped' },
  { text: '已完成', value: 'completed' },
  { text: '已取消', value: 'cancelled' },
]

const columns = [
  { key: 'orderNumber', label: '订单号' },
  { key: 'user', label: '用户' },
  { key: 'status', label: '状态' },
  { key: 'total', label: '金额' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'actions', label: '操作' },
]

const searchOrders = () => {
  loadOrders()
}

const resetSearch = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  loadOrders()
}

const loadOrders = async () => {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    loading.value = false
  }
}

const viewOrder = (order: Order) => {
  console.log('查看订单:', order)
}

const editOrder = (order: Order) => {
  console.log('编辑订单:', order)
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return texts[status] || status
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.admin-orders {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--va-text-primary);
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) auto;
  gap: 1rem;
  align-items: end;
}

.filter-item {
  min-width: 0;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.stat-icon.total {
  background: var(--va-primary);
}

.stat-icon.completed {
  background: #10b981;
}

.stat-icon.pending {
  background: #f59e0b;
}

.stat-icon.cancelled {
  background: #ef4444;
}

.stat-details {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.25rem;
  color: var(--va-text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  font-weight: 500;
}

.orders-table {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow-x: auto;
}

.data-table {
  min-width: 800px;
}

.order-number {
  font-family: monospace;
  font-weight: 600;
  color: var(--va-primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 500;
  color: var(--va-text-primary);
}

.user-email {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.paid {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.shipped {
  background: #e0e7ff;
  color: #5b21b6;
}

.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.order-total {
  font-weight: 600;
  color: var(--va-text-primary);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    justify-content: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .orders-table {
    padding: 1rem;
  }
}
</style>
