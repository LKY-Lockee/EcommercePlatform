<template>
  <div class="admin-products">
    <div class="page-header">
      <h1 class="page-title">商品管理</h1>
      <va-button @click="showCreateDialog = true" icon="add"> 添加商品 </va-button>
    </div>

    <!-- 搜索和筛选 -->
    <va-card class="filter-card">
      <va-card-content>
        <va-row :gutter="16">
          <va-column :xs="12" :md="6" :lg="4">
            <va-input
              v-model="searchQuery"
              label="搜索商品"
              placeholder="输入商品名称"
              clearable
              @input="handleSearch"
            >
              <template #prepend>
                <va-icon name="search" />
              </template>
            </va-input>
          </va-column>
          <va-column :xs="12" :md="6" :lg="4">
            <va-select
              v-model="selectedCategory"
              label="商品分类"
              :options="categoryOptions"
              clearable
              @update:modelValue="loadProducts"
            />
          </va-column>
        </va-row>
      </va-card-content>
    </va-card>

    <!-- 商品列表 -->
    <va-card>
      <va-card-content>
        <va-data-table
          :items="products"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          @update:pagination="updatePagination"
          no-data-html="暂无商品"
        >
          <template #cell(image_url)="{ rowData }">
            <va-avatar :src="rowData.image_url || '/placeholder.png'" size="medium" square />
          </template>

          <template #cell(price)="{ rowData }">
            <div>
              <div class="price-current">¥{{ formatMoney(rowData.price) }}</div>
              <div
                v-if="rowData.original_price && rowData.original_price > rowData.price"
                class="price-original"
              >
                ¥{{ formatMoney(rowData.original_price) }}
              </div>
            </div>
          </template>

          <template #cell(status)="{ rowData }">
            <va-chip :color="getStatusColor(rowData.status)" small>
              {{ getStatusText(rowData.status) }}
            </va-chip>
          </template>

          <template #cell(featured)="{ rowData }">
            <va-chip v-if="rowData.featured" color="warning" small> 推荐 </va-chip>
          </template>

          <template #cell(stock)="{ rowData }">
            <span :class="{ 'low-stock': rowData.stock < 10 }">
              {{ rowData.stock }}
            </span>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="action-buttons">
              <va-button
                preset="secondary"
                size="small"
                icon="edit"
                @click="editProduct(rowData)"
              />
              <va-button
                preset="secondary"
                size="small"
                icon="delete"
                color="danger"
                @click="deleteProductConfirm(rowData)"
              />
            </div>
          </template>
        </va-data-table>
      </va-card-content>
    </va-card>

    <!-- 创建/编辑商品对话框 -->
    <va-modal v-model="showCreateDialog" title="添加商品" @ok="handleCreateProduct">
      <product-form
        ref="productFormRef"
        :product="currentProduct"
        :categories="categories"
        @submit="handleCreateProduct"
      />
    </va-modal>

    <va-modal v-model="showEditDialog" title="编辑商品" @ok="handleUpdateProduct">
      <product-form
        ref="productFormRef"
        :product="currentProduct"
        :categories="categories"
        @submit="handleUpdateProduct"
      />
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type AdminProduct,
} from '@/api/admin'
import { getCategories, type Category } from '@/api/category'
import ProductForm from '@/components/admin/ProductForm.vue'

const loading = ref(false)
const products = ref<AdminProduct[]>([])
const categories = ref<Category[]>([])
const searchQuery = ref('')
const selectedCategory = ref('')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const currentProduct = ref<Partial<AdminProduct>>({})
const productFormRef = ref()

const pagination = ref({
  page: 1,
  perPage: 20,
  total: 0,
})

const columns = [
  { key: 'image_url', label: '图片', width: '80px' },
  { key: 'name', label: '商品名称', sortable: true },
  { key: 'category_name', label: '分类' },
  { key: 'price', label: '价格', sortable: true },
  { key: 'stock', label: '库存', sortable: true },
  { key: 'status', label: '状态' },
  { key: 'featured', label: '推荐' },
  { key: 'actions', label: '操作', width: '120px' },
]

const categoryOptions = computed(() => [
  { text: '全部分类', value: '' },
  ...categories.value.map((cat) => ({ text: cat.name, value: cat.id.toString() })),
])

const loadProducts = async () => {
  try {
    loading.value = true
    const response = await getAdminProducts({
      page: pagination.value.page,
      limit: pagination.value.perPage,
      search: searchQuery.value,
      category: selectedCategory.value,
    })
    products.value = response.data.products || []
    pagination.value.total = response.data.total
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadProducts()
}

const updatePagination = (newPagination: Partial<typeof pagination.value>) => {
  pagination.value = { ...pagination.value, ...newPagination }
  loadProducts()
}

const editProduct = (product: AdminProduct) => {
  currentProduct.value = { ...product }
  showEditDialog.value = true
}

const handleCreateProduct = async () => {
  try {
    const formData = await productFormRef.value?.validate()
    if (formData) {
      await createProduct(formData)
      showCreateDialog.value = false
      loadProducts()
      currentProduct.value = {}
    }
  } catch (error) {
    console.error('创建商品失败:', error)
  }
}

const handleUpdateProduct = async () => {
  try {
    const formData = await productFormRef.value?.validate()
    if (formData && currentProduct.value.id) {
      await updateProduct(currentProduct.value.id, formData)
      showEditDialog.value = false
      loadProducts()
      currentProduct.value = {}
    }
  } catch (error) {
    console.error('更新商品失败:', error)
  }
}

const deleteProductConfirm = (product: AdminProduct) => {
  if (confirm(`确定要删除商品 "${product.name}" 吗？`)) {
    handleDeleteProduct(product.id)
  }
}

const handleDeleteProduct = async (id: number) => {
  try {
    await deleteProduct(id)
    loadProducts()
  } catch (error) {
    console.error('删除商品失败:', error)
  }
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'success',
    inactive: 'secondary',
    out_of_stock: 'danger',
  }
  return colors[status] || 'primary'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '启用',
    inactive: '禁用',
    out_of_stock: '缺货',
  }
  return texts[status] || status
}

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>

<style scoped>
.admin-products {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  color: var(--va-primary);
}

.filter-card {
  margin-bottom: 24px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.price-current {
  font-weight: 600;
  color: var(--va-primary);
}

.price-original {
  font-size: 12px;
  color: var(--va-secondary);
  text-decoration: line-through;
}

.low-stock {
  color: var(--va-danger);
  font-weight: 600;
}
</style>
