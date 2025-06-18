<template>
  <div class="admin-products">
    <div class="header-section">
      <div class="filter-section">
        <div class="filter-item">
          <va-input
            v-model="searchQuery"
            placeholder="搜索商品名称"
            clearable
            @input="handleSearch"
            class="search-input"
          >
            <template #appendInner>
              <va-button
                preset="plain"
                @click="handleSearch"
                icon="search"
                size="small"
                color="primary"
              />
            </template>
          </va-input>
        </div>
        <div class="filter-item">
          <va-select
            v-model="selectedCategory"
            placeholder="选择分类"
            :options="categoryOptions"
            value-by="value"
            clearable
            @update:modelValue="loadProducts"
          />
        </div>
      </div>
      <va-button @click="openCreateDialog" icon="add"> 添加商品 </va-button>
    </div>

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
          <va-avatar :src="rowData.image" size="medium" square />
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

    <va-modal
      v-model="showProductDialog"
      :title="isEditing ? '编辑商品' : '添加商品'"
      size="large"
      max-width="900px"
      hide-default-actions
      class="product-modal"
    >
      <div class="product-form">
        <va-form ref="productFormRef" @submit.prevent="handleFormSubmit">
          <va-card class="form-card">
            <va-card-title class="form-section-title">基本信息</va-card-title>
            <va-card-content>
              <div class="form-grid">
                <div class="form-field">
                  <va-input
                    v-model="productForm.name"
                    label="商品名称"
                    placeholder="请输入商品名称"
                    :rules="[required]"
                    required
                    clearable
                  />
                </div>
                <div class="form-field">
                  <va-select
                    v-model="productForm.category_id"
                    label="商品分类"
                    placeholder="请选择商品分类"
                    :options="formCategoryOptions"
                    value-by="value"
                    :rules="[required]"
                    required
                    clearable
                  />
                </div>
              </div>

              <div class="form-grid">
                <div class="form-field">
                  <va-input
                    v-model="productForm.sku"
                    label="商品编码(SKU)"
                    placeholder="请输入商品编码"
                    clearable
                  />
                </div>
                <div class="form-field">
                  <va-input
                    v-model="productForm.brand"
                    label="品牌"
                    placeholder="请输入品牌名称"
                    clearable
                  />
                </div>
              </div>

              <div class="form-field-full">
                <va-textarea
                  v-model="productForm.description"
                  label="商品描述"
                  placeholder="请输入商品描述"
                  rows="3"
                  autosize
                  clearable
                />
              </div>
            </va-card-content>
          </va-card>

          <va-card class="form-card">
            <va-card-title class="form-section-title">价格与库存</va-card-title>
            <va-card-content>
              <div class="form-grid-three">
                <div class="form-field">
                  <va-input
                    v-model.number="productForm.price"
                    label="销售价格"
                    type="number"
                    placeholder="0.00"
                    :rules="[required, minValue]"
                    required
                    step="0.01"
                    min="0"
                  >
                    <template #prepend>
                      <span class="currency-symbol">¥</span>
                    </template>
                  </va-input>
                </div>
                <div class="form-field">
                  <va-input
                    v-model.number="productForm.original_price"
                    label="原价（划线价）"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  >
                    <template #prepend>
                      <span class="currency-symbol">¥</span>
                    </template>
                  </va-input>
                </div>
                <div class="form-field">
                  <va-input
                    v-model.number="productForm.stock"
                    label="库存数量"
                    type="number"
                    placeholder="0"
                    :rules="[required, minStockValue]"
                    required
                    min="0"
                  />
                </div>
              </div>
            </va-card-content>
          </va-card>

          <va-card class="form-card">
            <va-card-title class="form-section-title">商品图片与设置</va-card-title>
            <va-card-content>
              <div class="form-grid-image">
                <div class="form-field-image">
                  <va-input
                    v-model="productForm.image"
                    label="商品主图"
                    placeholder="请输入图片URL"
                    clearable
                  />
                </div>
                <div class="form-field-checkbox">
                  <div class="checkbox-container">
                    <va-checkbox
                      v-model="productForm.featured"
                      label="设为推荐商品"
                      class="featured-checkbox"
                    />
                    <p class="checkbox-hint">推荐商品将在首页和推荐位置优先展示</p>
                  </div>
                </div>
              </div>

              <div v-if="productForm.image" class="image-preview">
                <img :src="productForm.image" alt="商品预览" />
              </div>
            </va-card-content>
          </va-card>

          <div class="form-actions">
            <va-button @click="cancelForm" preset="secondary" size="large"> 取消 </va-button>
            <va-button
              @click="handleFormSubmit"
              color="primary"
              size="large"
              :loading="formSubmitting"
            >
              {{ isEditing ? '更新商品' : '创建商品' }}
            </va-button>
          </div>
        </va-form>
      </div>
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '@/api/admin'
import { getCategories } from '@/api/category'
import type { AdminProduct, Category } from '@/types'

const loading = ref(false)
const products = ref<AdminProduct[]>([])
const categories = ref<Category[]>([])
const searchQuery = ref('')
const selectedCategory = ref<number | undefined>(undefined)
const showProductDialog = ref(false)
const isEditing = ref(false)
const formSubmitting = ref(false)
const productFormRef = ref()

const productForm = ref({
  name: '',
  description: '',
  price: 0,
  original_price: 0,
  stock: 0,
  category_id: undefined as number | undefined,
  brand: '',
  sku: '',
  featured: false,
  image: '',
  id: undefined as number | undefined,
})

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
  { text: '全部分类', value: undefined },
  ...categories.value.map((cat) => ({ text: cat.name, value: cat.id })),
])

const formCategoryOptions = computed(() =>
  categories.value.map((cat) => ({ text: cat.name, value: cat.id })),
)

const required = (value: unknown) => !!value || '此字段为必填项'
const minValue = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num >= 0 || '值不能小于0'
}
const minStockValue = (value: string | number) => {
  const num = typeof value === 'string' ? parseInt(value) : value
  return num >= 0 || '库存数量不能小于0'
}

const loadProducts = async () => {
  try {
    loading.value = true
    const params: {
      page: number
      limit: number
      search: string
      category_id?: number
    } = {
      page: pagination.value.page,
      limit: pagination.value.perPage,
      search: searchQuery.value,
    }

    if (selectedCategory.value !== undefined && selectedCategory.value !== null) {
      params.category_id = selectedCategory.value
    }

    const response = await getAdminProducts(params)
    const responseData = response.data
    if (responseData) {
      products.value = responseData.items || []
      pagination.value.total = responseData.pagination.total || 0
    } else {
      products.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await getCategories()
    const categoriesData = response.data
    categories.value = Array.isArray(categoriesData) ? categoriesData : []
  } catch (error) {
    console.error('加载分类失败:', error)
    categories.value = []
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
  productForm.value = {
    name: product.name,
    description: product.description,
    price: product.price,
    original_price: product.original_price || 0,
    stock: product.stock,
    category_id: product.category_id,
    brand: product.brand || '',
    sku: product.sku,
    featured: Boolean(product.featured),
    image: product.image || '',
    id: product.id,
  }
  isEditing.value = true
  showProductDialog.value = true
}

const openCreateDialog = () => {
  resetProductForm()
  isEditing.value = false
  showProductDialog.value = true
}

const resetProductForm = () => {
  productForm.value = {
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    stock: 0,
    category_id: undefined,
    brand: '',
    sku: '',
    featured: false,
    image: '',
    id: undefined,
  }
}

const handleFormSubmit = async () => {
  try {
    const isValid = await productFormRef.value?.validate()
    if (isValid) {
      formSubmitting.value = true

      if (isEditing.value) {
        if (productForm.value.id) {
          const updateData = {
            name: productForm.value.name,
            description: productForm.value.description,
            price: productForm.value.price,
            original_price: productForm.value.original_price,
            stock: productForm.value.stock,
            category_id: productForm.value.category_id,
            brand: productForm.value.brand,
            sku: productForm.value.sku,
            featured: productForm.value.featured ? 1 : 0,
            image: productForm.value.image || '',
          }

          await updateProduct(productForm.value.id, updateData)
        }
      } else {
        const createData = {
          name: productForm.value.name || '',
          description: productForm.value.description || '',
          price: productForm.value.price || 0,
          original_price: productForm.value.original_price,
          stock: productForm.value.stock || 0,
          category_id: productForm.value.category_id || 0,
          brand: productForm.value.brand,
          sku: productForm.value.sku || '',
          featured: productForm.value.featured ? 1 : 0,
          image: productForm.value.image || '',
        }

        await createProduct(createData)
      }

      showProductDialog.value = false
      resetProductForm()
      loadProducts()
    }
  } catch (error) {
    console.error(isEditing.value ? '更新商品失败:' : '创建商品失败:', error)
  } finally {
    formSubmitting.value = false
  }
}

const cancelForm = () => {
  showProductDialog.value = false
  resetProductForm()
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

.product-modal :deep(.va-modal__title) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.product-form {
  padding: 0 4px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  &:not(:last-child) {
    margin-bottom: 1rem;
  }
}

.form-grid-three {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;

  &:not(:last-child) {
    margin-bottom: 1rem;
  }
}

.form-grid-image {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field-full:not(:last-child) {
  margin-bottom: 1rem;
}

.form-field-image {
  display: flex;
  flex-direction: column;
}

.form-field-checkbox {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

@media (max-width: 768px) {
  .form-grid,
  .form-grid-three,
  .form-grid-image {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
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

.currency-symbol {
  color: #6b7280;
  font-weight: 500;
  margin-right: 0.5rem;
}

.checkbox-container {
  padding-top: 0.5rem;
}

.featured-checkbox {
  margin-bottom: 0.75rem;
}

.featured-checkbox :deep(.va-checkbox__label) {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.checkbox-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.image-preview {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  padding: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.product-form :deep(.va-input__container) {
  border-radius: 8px;
  transition: all 0.2s ease;
  min-height: 44px;
}

.product-form :deep(.va-input__container):hover {
  border-color: var(--va-primary);
}

.product-form :deep(.va-input__container--focused) {
  border-color: var(--va-primary);
  box-shadow: 0 0 0 3px rgba(var(--va-primary-rgb), 0.1);
}

.product-form :deep(.va-select__anchor) {
  border-radius: 8px;
  min-height: 44px;
}

.product-form :deep(.va-textarea__container) {
  border-radius: 8px;
}

.product-form :deep(.va-input) {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .header-section {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .filter-section {
    flex-direction: column;
  }

  .products-table {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .va-button {
    width: 100%;
  }

  .product-form {
    max-height: 60vh;
  }

  .form-card :deep(.va-card__content) {
    padding: 1rem;
  }
}

.product-form::-webkit-scrollbar {
  width: 6px;
}

.product-form::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.product-form::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.product-form::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
