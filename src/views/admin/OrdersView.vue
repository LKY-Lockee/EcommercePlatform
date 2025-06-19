<template>
  <div class="admin-orders">
    <!-- 搜索和筛选 -->
    <div class="header-section">
      <div class="filter-section">
        <div class="filter-item">
          <va-input
            v-model="searchQuery"
            placeholder="搜索订单号、用户名"
            clearable
            @input="loadOrders"
            class="search-input"
          >
            <template #appendInner>
              <va-button
                preset="plain"
                @click="loadOrders"
                icon="search"
                size="small"
                color="primary"
              />
            </template>
          </va-input>
        </div>
        <div class="filter-item">
          <va-select
            v-model="statusFilter"
            placeholder="选择订单状态"
            :options="statusOptions"
            text-by="text"
            value-by="value"
            clearable
            @update:modelValue="loadOrders"
          />
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
            <div class="stat-label">已送达</div>
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
      <va-data-table
        :items="orders"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @update:pagination="updatePagination"
        no-data-html="暂无订单"
        class="data-table"
      >
        <template #cell(order_number)="{ rowData }">
          <span class="order-number">{{ rowData.order_number }}</span>
        </template>

        <template #cell(user)="{ rowData }">
          <div class="user-info">
            <va-avatar size="small" :src="rowData.user?.avatar" />
            <div class="user-details">
              <div class="user-name">{{ rowData.user?.username }}</div>
              <div class="user-email">{{ rowData.user?.email }}</div>
            </div>
          </div>
        </template>

        <template #cell(status)="{ rowData }">
          <va-chip :color="getStatusColor(rowData.status)" size="small" square>
            {{ getStatusText(rowData.status) }}
          </va-chip>
        </template>

        <template #cell(total_amount)="{ rowData }">
          <span class="order-total">¥{{ Number(rowData.total_amount).toFixed(2) }}</span>
        </template>

        <template #cell(created_at)="{ rowData }">
          <span class="order-date">{{ formatDate(rowData.created_at) }}</span>
        </template>

        <template #cell(actions)="{ rowData }">
          <div class="action-buttons">
            <va-button
              preset="plain"
              size="small"
              icon="edit"
              @click="editOrder(rowData)"
              color="warning"
            />
            <va-button
              preset="plain"
              size="small"
              icon="delete"
              @click="deleteOrder(rowData)"
              color="danger"
            />
          </div>
        </template>
      </va-data-table>
    </div>

    <!-- 编辑订单弹窗 -->
    <va-modal
      v-model="showEditDialog"
      :title="'编辑订单'"
      size="large"
      max-width="600px"
      hide-default-actions
      class="order-modal"
    >
      <div class="order-form">
        <va-form ref="orderFormRef" @submit.prevent="handleFormSubmit">
          <!-- 订单状态卡片 -->
          <va-card class="form-card">
            <va-card-title class="form-section-title">订单状态</va-card-title>
            <va-card-content>
              <div class="form-grid">
                <div class="form-field">
                  <va-select
                    v-model="orderForm.status"
                    label="订单状态"
                    placeholder="请选择订单状态"
                    :options="statusOptions"
                    text-by="text"
                    value-by="value"
                    :rules="[required]"
                    required
                  />
                </div>
              </div>
            </va-card-content>
          </va-card>
        </va-form>
      </div>

      <div class="form-actions">
        <va-button @click="closeEditDialog" preset="secondary" size="large"> 取消 </va-button>
        <va-button @click="handleFormSubmit" color="primary" size="large"> 保存 </va-button>
      </div>
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminOrders, updateAdminOrder, deleteAdminOrder } from '@/api/admin'
import type { AdminOrder, OrderStatus } from '@/types'

const searchQuery = ref('')
const statusFilter = ref<OrderStatus | ''>('')
const loading = ref(false)
const submitting = ref(false)
const showEditDialog = ref(false)
const selectedOrder = ref<AdminOrder | null>(null)

// 分页
const pagination = ref({
  page: 1,
  perPage: 10,
  total: 0,
})

// 表单
const orderFormRef = ref()
const orderForm = ref({
  status: '' as OrderStatus | '',
})

const stats = ref({
  total: 0,
  completed: 0,
  pending: 0,
  cancelled: 0,
})

const orders = ref<AdminOrder[]>([])

const statusOptions = [
  { text: '待支付', value: 'pending' },
  { text: '已支付', value: 'paid' },
  { text: '已发货', value: 'shipped' },
  { text: '已送达', value: 'delivered' },
  { text: '已取消', value: 'cancelled' },
]

const columns = [
  { key: 'order_number', label: '订单号', sortable: true },
  { key: 'user', label: '用户' },
  { key: 'status', label: '状态' },
  { key: 'total_amount', label: '金额', sortable: true },
  { key: 'created_at', label: '创建时间', sortable: true },
  { key: 'actions', label: '操作', width: 100 },
]

// 表单验证规则
const required = (value: unknown) => !!value || '此字段为必填项'

// 更新分页
const updatePagination = (newPagination: typeof pagination.value) => {
  pagination.value = { ...newPagination }
  loadOrders()
}

const loadOrders = async () => {
  loading.value = true
  try {
    const response = await getAdminOrders({
      search: searchQuery.value,
      status: statusFilter.value || undefined,
      page: pagination.value.page,
      limit: pagination.value.perPage,
    })
    const responseData = response.data
    if (responseData && responseData.items) {
      orders.value = responseData.items

      // 更新分页信息
      if (responseData.pagination) {
        pagination.value.total = responseData.pagination.total
      }

      // 计算统计信息
      stats.value = {
        total: responseData.pagination?.total || 0,
        completed: orders.value.filter((o) => o.status === 'delivered').length,
        pending: orders.value.filter((o) => o.status === 'pending').length,
        cancelled: orders.value.filter((o) => o.status === 'cancelled').length,
      }
    } else {
      orders.value = []
      stats.value = {
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
      }
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    console.log('加载订单失败')
    orders.value = []
    stats.value = {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
    }
  } finally {
    loading.value = false
  }
}

const editOrder = (order: AdminOrder) => {
  selectedOrder.value = order
  orderForm.value = {
    status: order.status,
  }
  showEditDialog.value = true
}

const deleteOrder = async (order: AdminOrder) => {
  try {
    if (confirm(`确定要删除订单 ${order.order_number} 吗？`)) {
      await deleteAdminOrder(order.id)
      console.log('订单删除成功')
      loadOrders()
    }
  } catch (error) {
    console.error('删除订单失败:', error)
    console.log('删除订单失败')
  }
}

const closeEditDialog = () => {
  showEditDialog.value = false
  selectedOrder.value = null
  orderForm.value = {
    status: '',
  }
}

const handleFormSubmit = async () => {
  if (!selectedOrder.value) return

  try {
    submitting.value = true
    await updateAdminOrder(selectedOrder.value.id, {
      status: orderForm.value.status as OrderStatus,
    })

    console.log('订单更新成功')

    closeEditDialog()
    loadOrders()
  } catch (error) {
    console.error('更新订单失败:', error)
    console.log('更新订单失败')
  } finally {
    submitting.value = false
  }
}

const getStatusText = (status: OrderStatus) => {
  const texts: Record<OrderStatus, string> = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消',
  }
  return texts[status] || status
}

const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    pending: 'warning',
    paid: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger',
  }
  return colors[status] || 'secondary'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
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

.header-section {
  display: flex;
  justify-content: space-between;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.filter-section {
  display: flex;
  gap: 1rem;
}

.filter-item {
  min-width: 0;
}

.search-input {
  width: 100%;
  border-radius: 25px;
}

.search-input :deep(.va-input__container) {
  border-radius: 25px;
  background: rgba(var(--va-background-secondary-rgb), 0.5);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  padding-right: 40px;
}

.search-input :deep(.va-input__container):hover {
  border-color: var(--va-primary);
  box-shadow: 0 0 0 3px rgba(var(--va-primary-rgb), 0.1);
}

.search-input :deep(.va-input__container--focused) {
  border-color: var(--va-primary);
  box-shadow: 0 0 0 3px rgba(var(--va-primary-rgb), 0.15);
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
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  color: var(--va-primary);
  background: rgba(var(--va-primary-rgb), 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
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
  font-size: 0.875rem;
}

.user-email {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
}

.order-total {
  font-weight: 600;
  color: var(--va-text-primary);
  font-size: 0.875rem;
}

.order-date {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* 弹窗样式 */
.order-modal :deep(.va-modal__container) {
  border-radius: 12px;
  overflow: hidden;
}

.order-modal :deep(.va-modal__title) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.order-form {
  padding: 0;
}

.form-card {
  margin-bottom: 1.25rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-section-title {
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  color: #374151 !important;
}

.form-card :deep(.va-card__title) {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.25rem 1.5rem;
  margin: 0;
}

.form-card :deep(.va-card__content) {
  padding: 1.75rem 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-field {
  min-width: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 0 0.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
}

.form-actions .va-button {
  min-width: 120px;
  height: 44px;
  font-size: 0.95rem;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .header-section {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-section {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .orders-table {
    padding: 1rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-content {
    gap: 0.75rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }
}
</style>
