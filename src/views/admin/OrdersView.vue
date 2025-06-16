<template>
  <div class="orders-management">
    <VaCard>
      <VaCardHeader>
        <h1 class="va-h3">订单管理</h1>
      </VaCardHeader>
      <VaCardContent>
        <!-- 搜索过滤器 -->
        <div class="row align-items-end mb-4">
          <div class="flex md6 lg3">
            <VaInput v-model="searchQuery" placeholder="搜索订单号、用户..." clearable />
          </div>
          <div class="flex md6 lg3">
            <VaSelect
              v-model="statusFilter"
              :options="statusOptions"
              text-by="text"
              value-by="value"
              placeholder="订单状态"
              clearable
            />
          </div>
          <div class="flex md6 lg3">
            <VaDateInput v-model="dateRange" mode="range" placeholder="选择日期范围" clearable />
          </div>
          <div class="flex md6 lg3">
            <VaButton @click="searchOrders" color="primary"> 搜索 </VaButton>
            <VaButton @click="resetSearch" preset="secondary" class="ml-2"> 重置 </VaButton>
          </div>
        </div>

        <!-- 订单统计 -->
        <div class="row mb-4">
          <div class="flex md3">
            <VaCard color="primary" text-color="white">
              <VaCardContent>
                <div class="va-h4">{{ stats.total }}</div>
                <div>总订单数</div>
              </VaCardContent>
            </VaCard>
          </div>
          <div class="flex md3">
            <VaCard color="success" text-color="white">
              <VaCardContent>
                <div class="va-h4">{{ stats.completed }}</div>
                <div>已完成</div>
              </VaCardContent>
            </VaCard>
          </div>
          <div class="flex md3">
            <VaCard color="warning" text-color="white">
              <VaCardContent>
                <div class="va-h4">{{ stats.pending }}</div>
                <div>待处理</div>
              </VaCardContent>
            </VaCard>
          </div>
          <div class="flex md3">
            <VaCard color="danger" text-color="white">
              <VaCardContent>
                <div class="va-h4">{{ stats.cancelled }}</div>
                <div>已取消</div>
              </VaCardContent>
            </VaCard>
          </div>
        </div>

        <!-- 订单列表 -->
        <VaDataTable :items="orders" :columns="columns" :loading="loading" striped hoverable>
          <template #cell(orderNumber)="{ rowData }">
            <VaChip color="primary" size="small">
              {{ rowData.orderNumber }}
            </VaChip>
          </template>

          <template #cell(user)="{ rowData }">
            <div class="flex items-center gap-2">
              <VaAvatar size="small" :src="rowData.user?.avatar" />
              <div>
                <div class="va-text-bold">{{ rowData.user?.name }}</div>
                <div class="va-text-secondary">{{ rowData.user?.email }}</div>
              </div>
            </div>
          </template>

          <template #cell(status)="{ rowData }">
            <VaChip :color="getStatusColor(rowData.status)" size="small">
              {{ getStatusText(rowData.status) }}
            </VaChip>
          </template>

          <template #cell(total)="{ rowData }">
            <span class="va-text-bold">¥{{ rowData.total.toFixed(2) }}</span>
          </template>

          <template #cell(createdAt)="{ rowData }">
            {{ formatDate(rowData.createdAt) }}
          </template>

          <template #cell(actions)="{ rowData }">
            <VaButton
              preset="secondary"
              size="small"
              icon="visibility"
              @click="viewOrder(rowData)"
              class="mr-2"
            />
            <VaDropdown placement="bottom-end">
              <template #anchor>
                <VaButton preset="secondary" size="small" icon="more_vert" />
              </template>
              <VaDropdownContent>
                <VaList>
                  <VaListItem @click="updateOrderStatus(rowData, 'processing')">
                    <VaListItemSection>
                      <VaListItemLabel>处理中</VaListItemLabel>
                    </VaListItemSection>
                  </VaListItem>
                  <VaListItem @click="updateOrderStatus(rowData, 'shipped')">
                    <VaListItemSection>
                      <VaListItemLabel>已发货</VaListItemLabel>
                    </VaListItemSection>
                  </VaListItem>
                  <VaListItem @click="updateOrderStatus(rowData, 'delivered')">
                    <VaListItemSection>
                      <VaListItemLabel>已送达</VaListItemLabel>
                    </VaListItemSection>
                  </VaListItem>
                  <VaListItem @click="updateOrderStatus(rowData, 'cancelled')">
                    <VaListItemSection>
                      <VaListItemLabel>取消订单</VaListItemLabel>
                    </VaListItemSection>
                  </VaListItem>
                </VaList>
              </VaDropdownContent>
            </VaDropdown>
          </template>
        </VaDataTable>

        <!-- 分页 -->
        <div class="row justify-center mt-4">
          <VaPagination
            v-model="currentPage"
            :pages="totalPages"
            :visible-pages="5"
            @change="loadOrders"
          />
        </div>
      </VaCardContent>
    </VaCard>

    <!-- 订单详情弹窗 -->
    <VaModal v-model="showOrderDetail" size="large" title="订单详情">
      <div v-if="selectedOrder" class="order-detail">
        <div class="row mb-4">
          <div class="flex md6">
            <VaCard>
              <VaCardHeader>
                <h3>订单信息</h3>
              </VaCardHeader>
              <VaCardContent>
                <div class="detail-item">
                  <strong>订单号：</strong>{{ selectedOrder.orderNumber }}
                </div>
                <div class="detail-item">
                  <strong>订单状态：</strong>
                  <VaChip :color="getStatusColor(selectedOrder.status)" size="small">
                    {{ getStatusText(selectedOrder.status) }}
                  </VaChip>
                </div>
                <div class="detail-item">
                  <strong>下单时间：</strong>{{ formatDate(selectedOrder.createdAt) }}
                </div>
                <div class="detail-item">
                  <strong>订单总额：</strong>¥{{ selectedOrder.total.toFixed(2) }}
                </div>
              </VaCardContent>
            </VaCard>
          </div>
          <div class="flex md6">
            <VaCard>
              <VaCardHeader>
                <h3>用户信息</h3>
              </VaCardHeader>
              <VaCardContent>
                <div class="detail-item">
                  <strong>用户名：</strong>{{ selectedOrder.user?.name }}
                </div>
                <div class="detail-item">
                  <strong>邮箱：</strong>{{ selectedOrder.user?.email }}
                </div>
                <div class="detail-item">
                  <strong>电话：</strong>{{ selectedOrder.user?.phone }}
                </div>
              </VaCardContent>
            </VaCard>
          </div>
        </div>

        <VaCard>
          <VaCardHeader>
            <h3>收货地址</h3>
          </VaCardHeader>
          <VaCardContent>
            <div v-if="selectedOrder.shippingAddress">
              <div class="detail-item">
                <strong>收货人：</strong>{{ selectedOrder.shippingAddress.name }}
              </div>
              <div class="detail-item">
                <strong>电话：</strong>{{ selectedOrder.shippingAddress.phone }}
              </div>
              <div class="detail-item">
                <strong>地址：</strong>{{ selectedOrder.shippingAddress.address }}
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="mt-4">
          <VaCardHeader>
            <h3>订单商品</h3>
          </VaCardHeader>
          <VaCardContent>
            <VaDataTable
              :items="selectedOrder.items || []"
              :columns="orderItemColumns"
              hide-default-header
            >
              <template #cell(product)="{ rowData }">
                <div class="flex items-center gap-3">
                  <img
                    :src="rowData.product?.image || '/placeholder.jpg'"
                    :alt="rowData.product?.name"
                    class="product-image"
                  />
                  <div>
                    <div class="va-text-bold">{{ rowData.product?.name }}</div>
                    <div class="va-text-secondary">{{ rowData.product?.description }}</div>
                  </div>
                </div>
              </template>

              <template #cell(price)="{ rowData }"> ¥{{ rowData.price?.toFixed(2) }} </template>

              <template #cell(total)="{ rowData }">
                <span class="va-text-bold"
                  >¥{{ (rowData.price * rowData.quantity).toFixed(2) }}</span
                >
              </template>
            </VaDataTable>
          </VaCardContent>
        </VaCard>
      </div>

      <template #footer>
        <VaButton @click="showOrderDetail = false"> 关闭 </VaButton>
      </template>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { adminApi } from '@/api/admin'

interface User {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
}

interface Product {
  id: number
  name: string
  description: string
  image: string
}

interface OrderItem {
  id: number
  product: Product
  quantity: number
  price: number
}

interface ShippingAddress {
  name: string
  phone: string
  address: string
}

interface Order {
  id: number
  orderNumber: string
  user: User
  status: string
  total: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  shippingAddress: ShippingAddress
}

// 响应式数据
const orders = ref<Order[]>([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref<Date[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const showOrderDetail = ref(false)
const selectedOrder = ref<Order | null>(null)

// 计算属性
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

// 订单状态选项
const statusOptions = [
  { text: '待支付', value: 'pending' },
  { text: '处理中', value: 'processing' },
  { text: '已发货', value: 'shipped' },
  { text: '已送达', value: 'delivered' },
  { text: '已取消', value: 'cancelled' },
]

// 统计数据
const stats = ref({
  total: 0,
  completed: 0,
  pending: 0,
  cancelled: 0,
})

// 表格列定义
const columns = [
  { key: 'orderNumber', label: '订单号' },
  { key: 'user', label: '用户' },
  { key: 'status', label: '状态' },
  { key: 'total', label: '金额' },
  { key: 'createdAt', label: '下单时间' },
  { key: 'actions', label: '操作' },
]

// 订单商品列定义
const orderItemColumns = [
  { key: 'product', label: '商品' },
  { key: 'quantity', label: '数量' },
  { key: 'price', label: '单价' },
  { key: 'total', label: '小计' },
]

// 方法
const loadOrders = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
      status: statusFilter.value,
      startDate: dateRange.value[0]?.toISOString(),
      endDate: dateRange.value[1]?.toISOString(),
    }

    const response = await adminApi.getOrders(params)
    orders.value = response.data.orders
    totalItems.value = response.data.total
    stats.value = response.data.stats
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    loading.value = false
  }
}

const searchOrders = () => {
  currentPage.value = 1
  loadOrders()
}

const resetSearch = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateRange.value = []
  currentPage.value = 1
  loadOrders()
}

const viewOrder = (order: Order) => {
  selectedOrder.value = order
  showOrderDetail.value = true
}

const updateOrderStatus = async (order: Order, status: string) => {
  try {
    await adminApi.updateOrderStatus(order.id, status)
    order.status = status
    // 刷新统计数据
    loadOrders()
  } catch (error) {
    console.error('更新订单状态失败:', error)
  }
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger',
  }
  return colors[status] || 'secondary'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    pending: '待支付',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消',
  }
  return texts[status] || status
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-management {
  padding: 1rem;
}

.detail-item {
  margin-bottom: 0.5rem;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.order-detail {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
