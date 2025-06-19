<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon users">
            <va-icon name="people" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ stats.users }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon products">
            <va-icon name="inventory" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ stats.products }}</div>
            <div class="stat-label">商品总数</div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon orders">
            <va-icon name="receipt" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ stats.orders }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon revenue">
            <va-icon name="monetization_on" />
          </div>
          <div class="stat-details">
            <div class="stat-number">¥{{ formatMoney(stats.revenue) }}</div>
            <div class="stat-label">总收入</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近订单 -->
    <div class="recent-orders">
      <h3 class="section-title">最近订单</h3>
      <div class="orders-table-container">
        <va-data-table
          :items="stats.recentOrders"
          :columns="orderColumns"
          :loading="loading"
          no-data-html="暂无订单"
          class="orders-table"
        >
          <template #cell(status)="{ rowData }">
            <span :class="`status-badge ${rowData.status}`">
              {{ getStatusText(rowData.status) }}
            </span>
          </template>

          <template #cell(total_amount)="{ rowData }">
            ¥{{ formatMoney(rowData.total_amount) }}
          </template>

          <template #cell(created_at)="{ rowData }">
            {{ formatDate(rowData.created_at) }}
          </template>
        </va-data-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboardStats } from '@/api/admin'
import type { AdminStats } from '@/types'

const loading = ref(false)
const stats = ref<AdminStats>({
  users: 0,
  products: 0,
  orders: 0,
  revenue: 0,
  recentOrders: [],
})

const orderColumns = [
  { key: 'order_number', label: '订单号' },
  { key: 'username', label: '客户' },
  { key: 'status', label: '状态' },
  { key: 'total_amount', label: '金额' },
  { key: 'created_at', label: '创建时间' },
]

const loadStats = async () => {
  try {
    loading.value = true
    const response = await getDashboardStats()
    const statsData = response.data
    if (statsData) {
      stats.value = statsData
    } else {
      console.warn('统计数据格式不正确:', statsData)
      stats.value = {
        users: 0,
        products: 0,
        orders: 0,
        revenue: 0,
        recentOrders: [],
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    stats.value = {
      users: 0,
      products: 0,
      orders: 0,
      revenue: 0,
      recentOrders: [],
    }
  } finally {
    loading.value = false
  }
}

const formatMoney = (amount: number | null | undefined) => {
  // 处理空值和非数字值
  if (amount == null || isNaN(amount)) {
    return '0.00'
  }

  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (dateStr: string | null | undefined) => {
  // 处理空值和无效日期字符串
  if (!dateStr) {
    return '无'
  }

  const date = new Date(dateStr)

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '无效日期'
  }

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消',
  }
  return texts[status] || status
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.users {
  background: var(--va-primary);
}

.stat-icon.products {
  background: #10b981;
}

.stat-icon.orders {
  background: #f59e0b;
}

.stat-icon.revenue {
  background: #ef4444;
}

.stat-details {
  flex: 1;
}

.stat-number {
  font-size: 1.875rem;
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

.recent-orders {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--va-text-primary);
}

.orders-table-container {
  overflow-x: auto;
}

.orders-table {
  min-width: 600px;
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
  background: #d1fae5;
  color: #065f46;
}

.status-badge.shipped {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.delivered {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-content {
    gap: 0.75rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .recent-orders {
    padding: 1rem;
  }
}
</style>
