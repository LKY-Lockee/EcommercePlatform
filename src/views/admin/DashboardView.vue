<template>
  <div class="dashboard">
    <h1 class="page-title">管理仪表板</h1>

    <!-- 统计卡片 -->
    <va-row :gutter="20" class="stats-row">
      <va-column :xs="12" :md="6" :lg="3">
        <va-card class="stat-card">
          <va-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <va-icon name="people" size="large" color="primary" />
              </div>
              <div class="stat-details">
                <div class="stat-number">{{ stats.users }}</div>
                <div class="stat-label">用户总数</div>
              </div>
            </div>
          </va-card-content>
        </va-card>
      </va-column>

      <va-column :xs="12" :md="6" :lg="3">
        <va-card class="stat-card">
          <va-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <va-icon name="inventory" size="large" color="success" />
              </div>
              <div class="stat-details">
                <div class="stat-number">{{ stats.products }}</div>
                <div class="stat-label">商品总数</div>
              </div>
            </div>
          </va-card-content>
        </va-card>
      </va-column>

      <va-column :xs="12" :md="6" :lg="3">
        <va-card class="stat-card">
          <va-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <va-icon name="receipt" size="large" color="warning" />
              </div>
              <div class="stat-details">
                <div class="stat-number">{{ stats.orders }}</div>
                <div class="stat-label">订单总数</div>
              </div>
            </div>
          </va-card-content>
        </va-card>
      </va-column>

      <va-column :xs="12" :md="6" :lg="3">
        <va-card class="stat-card">
          <va-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <va-icon name="monetization_on" size="large" color="danger" />
              </div>
              <div class="stat-details">
                <div class="stat-number">¥{{ formatMoney(stats.revenue) }}</div>
                <div class="stat-label">总收入</div>
              </div>
            </div>
          </va-card-content>
        </va-card>
      </va-column>
    </va-row>

    <!-- 最近订单 -->
    <va-card class="recent-orders-card">
      <va-card-title>最近订单</va-card-title>
      <va-card-content>
        <va-data-table
          :items="stats.recentOrders"
          :columns="orderColumns"
          :loading="loading"
          no-data-html="暂无订单"
        >
          <template #cell(status)="{ rowData }">
            <va-chip :color="getStatusColor(rowData.status)" small>
              {{ getStatusText(rowData.status) }}
            </va-chip>
          </template>

          <template #cell(total_amount)="{ rowData }"> ¥{{ formatMoney(rowData.total) }} </template>

          <template #cell(created_at)="{ rowData }">
            {{ formatDate(rowData.createdAt) }}
          </template>
        </va-data-table>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboardStats, type AdminStats } from '@/api/admin'

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
    stats.value = response.data
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    paid: 'success',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'danger',
  }
  return colors[status] || 'primary'
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
  padding: 20px;
}

.page-title {
  margin-bottom: 24px;
  color: var(--va-primary);
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  margin-right: 16px;
}

.stat-details {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--va-secondary);
}

.recent-orders-card {
  margin-top: 24px;
}
</style>
