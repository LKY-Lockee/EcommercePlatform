<template>
  <div class="admin-products">
    <div class="page-header">
      <h2 class="page-title">商品管理</h2>
      <va-button @click="showCreateDialog = true" icon="add"> 添加商品 </va-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <va-input
            v-model="searchQuery"
            placeholder="搜索商品名称"
            clearable
            @input="handleSearch"
          >
            <template #prepend>
              <va-icon name="search" />
            </template>
          </va-input>
        </div>
        <div class="filter-item">
          <va-select
            v-model="selectedCategory"
            placeholder="选择分类"
            :options="categoryOptions"
            clearable
            @update:modelValue="loadProducts"
          />
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="products-table">
      <va-data-table
        :items="products"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @update:pagination="updatePagination"
        no-data-html="暂无商品"
        class="data-table"
      >
        <template #cell(image_url)="{ rowData }">
          <va-avatar :src="rowData.image_url || '/placeholder.png'" size="medium" square />
        </template>

        <template #cell(price)="{ rowData }">
          <div class="price-info">
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
          <span :class="`status-badge ${rowData.status}`">
            {{ getStatusText(rowData.status) }}
          </span>
        </template>

        <template #cell(featured)="{ rowData }">
          <span v-if="rowData.featured" class="featured-badge">推荐</span>
        </template>

        <template #cell(stock)="{ rowData }">
          <span :class="{ 'low-stock': rowData.stock < 10 }">
            {{ rowData.stock }}
          </span>
        </template>

        <template #cell(actions)="{ rowData }">
          <div class="action-buttons">
            <va-button preset="plain" size="small" icon="edit" @click="editProduct(rowData)" />
            <va-button
              preset="plain"
              size="small"
              icon="delete"
              color="danger"
              @click="deleteProductConfirm(rowData)"
            />
          </div>
        </template>
      </va-data-table>
    </div>

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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-item {
  min-width: 0;
}

.products-table {
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-current {
  font-weight: 600;
  color: var(--va-text-primary);
}

.price-original {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  text-decoration: line-through;
}

.low-stock {
  color: #ef4444;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.out_of_stock {
  background: #fee2e2;
  color: #dc2626;
}

.featured-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  background: #fef3c7;
  color: #d97706;
}

@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filter-section {
    padding: 1rem;
  }

  .products-table {
    padding: 1rem;
  }
}
</style>
