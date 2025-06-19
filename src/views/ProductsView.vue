<template>
  <div class="products-view">
    <div class="container">
      <!-- 页面标题和筛选 -->
      <div class="page-header">
        <h1 class="page-title">商品列表</h1>
        <div class="products-controls">
          <div class="sort-controls">
            <span class="sort-label">排序：</span>
            <va-select
              v-model="sortBy"
              :options="sortOptions"
              placeholder="选择排序方式"
              text-by="text"
              value-by="value"
              background="#ffffff"
              @update:model-value="loadProducts"
            />
          </div>
          <span class="results-count">共 {{ pagination.total }} 件商品</span>
        </div>
      </div>

      <div class="products-container">
        <!-- 侧边筛选栏 -->
        <aside class="filters-sidebar">
          <div class="filters-container">
            <div class="filter-header">
              <h3 class="filter-title">
                <va-icon name="filter_alt" size="1.2rem" />
                筛选条件
              </h3>
              <va-button preset="plain" size="small" @click="resetFilters" class="reset-btn">
                <va-icon name="refresh" size="small" />
                重置
              </va-button>
            </div>

            <!-- 分类筛选 -->
            <div class="filter-section">
              <div class="filter-section-header">
                <h4 class="filter-subtitle">
                  <va-icon name="category" size="1rem" />
                  商品分类
                </h4>
              </div>
              <div class="filter-content">
                <div class="category-list">
                  <div
                    class="category-item"
                    :class="{ active: selectedCategory === null }"
                    @click="selectAllCategories"
                  >
                    <span class="category-name">全部分类</span>
                    <va-badge v-if="selectedCategory === null" text="✓" color="primary" />
                  </div>
                  <div
                    v-for="category in categories"
                    :key="category.id"
                    class="category-item"
                    :class="{ active: selectedCategory === category.id }"
                    @click="selectCategory(category.id)"
                  >
                    <span class="category-name">{{ category.name }}</span>
                    <va-badge v-if="selectedCategory === category.id" text="✓" color="primary" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 价格筛选 -->
            <div class="filter-section">
              <div class="filter-section-header">
                <h4 class="filter-subtitle">
                  <va-icon name="attach_money" size="1rem" />
                  价格范围
                </h4>
              </div>
              <div class="filter-content">
                <div class="price-filter">
                  <div class="price-inputs">
                    <va-input
                      v-model="priceRange.min"
                      placeholder="最低价"
                      type="number"
                      size="small"
                      class="price-input"
                      @blur="applyFilters"
                      @keyup.enter="applyFilters"
                    >
                      <template #prependIcon>
                        <span class="price-symbol">¥</span>
                      </template>
                    </va-input>
                    <span class="price-separator">至</span>
                    <va-input
                      v-model="priceRange.max"
                      placeholder="最高价"
                      type="number"
                      size="small"
                      class="price-input"
                      @blur="applyFilters"
                      @keyup.enter="applyFilters"
                    >
                      <template #prependIcon>
                        <span class="price-symbol">¥</span>
                      </template>
                    </va-input>
                  </div>
                  <div class="price-shortcuts">
                    <va-button
                      v-for="range in priceRanges"
                      :key="range.label"
                      size="small"
                      preset="outline"
                      class="price-shortcut"
                      @click="setPriceRange(range.min, range.max)"
                    >
                      {{ range.label }}
                    </va-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- 主要内容区 -->
        <main class="products-main">
          <!-- 商品网格 -->
          <div v-if="loading" class="loading-container">
            <va-progress-circle indeterminate />
            <p>加载中...</p>
          </div>

          <div v-else-if="products.length === 0" class="no-products">
            <va-icon name="search_off" size="3rem" color="secondary" />
            <h3>没有找到商品</h3>
            <p>试试调整筛选条件或搜索关键词</p>
          </div>

          <div v-else class="products-grid">
            <ProductCard v-for="product in products" :key="product.id" :product="product" />
          </div>

          <!-- 分页 -->
          <div v-if="pagination.total_pages > 1" class="pagination-container">
            <va-pagination
              v-model="currentPage"
              :pages="pagination.total_pages"
              :visible-pages="5"
              @update:model-value="loadProducts"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProducts } from '@/api/product'
import { getCategories } from '@/api/category'
import type { Product, ProductListParams, Category } from '@/types'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()

// 响应式数据
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<number | null>(null)
const currentPage = ref(1)
const sortBy = ref('created_at_desc')
const priceRange = ref({ min: '', max: '' })

const pagination = ref({
  current_page: 1,
  per_page: 12,
  total: 0,
  total_pages: 1,
})

// 配置常量
const sortOptions = [
  { text: '最新发布', value: 'created_at_desc' },
  { text: '价格从低到高', value: 'price_asc' },
  { text: '价格从高到低', value: 'price_desc' },
  { text: '销量最高', value: 'sales_desc' },
  { text: '评分最高', value: 'rating_desc' },
]

const priceRanges = [
  { label: '100以下', min: 0, max: 100 },
  { label: '100-500', min: 100, max: 500 },
  { label: '500-1000', min: 500, max: 1000 },
  { label: '1000-2000', min: 1000, max: 2000 },
  { label: '2000以上', min: 2000, max: null },
]

// 加载商品数据
const loadProducts = async () => {
  loading.value = true

  try {
    const [sortField, sortOrder] = sortBy.value.split('_')
    const params: ProductListParams = {
      page: currentPage.value,
      limit: pagination.value.per_page,
      sort_by: sortField as 'created_at' | 'price' | 'sales' | 'rating',
      sort_order: sortOrder.toLowerCase() as 'asc' | 'desc',
    }

    if (selectedCategory.value) params.category_id = selectedCategory.value
    if (searchQuery.value) params.search = searchQuery.value
    if (priceRange.value.min && !isNaN(Number(priceRange.value.min))) {
      params.min_price = Number(priceRange.value.min)
    }
    if (priceRange.value.max && !isNaN(Number(priceRange.value.max))) {
      params.max_price = Number(priceRange.value.max)
    }

    const response = await getProducts(params)
    const responseData = response.data
    if (responseData && responseData.items) {
      products.value = responseData.items
      pagination.value = responseData.pagination
    } else {
      console.warn('商品数据格式不正确:', responseData)
      products.value = []
    }
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 筛选操作
const applyFilters = () => {
  currentPage.value = 1
  loadProducts()
}

const resetFilters = () => {
  selectedCategory.value = null
  priceRange.value = { min: '', max: '' }
  searchQuery.value = ''
  currentPage.value = 1
  loadProducts()
}

const setPriceRange = (min: number, max: number | null) => {
  priceRange.value.min = min.toString()
  priceRange.value.max = max ? max.toString() : ''
  applyFilters()
}

const selectAllCategories = () => {
  selectedCategory.value = null
  applyFilters()
}

const selectCategory = (categoryId: number) => {
  selectedCategory.value = categoryId
  applyFilters()
}

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.search) searchQuery.value = newQuery.search as string
    if (newQuery.category) selectedCategory.value = Number(newQuery.category)
    loadProducts()
  },
  { immediate: false },
)

// 初始化
onMounted(() => {
  if (route.query.search) searchQuery.value = route.query.search as string
  if (route.query.category) selectedCategory.value = Number(route.query.category)

  loadCategories()
  loadProducts()
})
</script>

<style scoped>
/* 基础布局 */
.products-view {
  min-height: 100vh;
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--va-text-primary);
  margin: 0;
  width: calc(280px + 1rem);
}

.products-controls {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sort-label {
  font-weight: 600;
  color: var(--va-text-primary);
}

.results-count {
  color: var(--va-text-secondary);
}

/* 主要容器 */
.products-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

/* 侧边栏 */
.filters-sidebar {
  height: fit-content;
  position: sticky;
  top: 5rem;
}

.filters-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0.5rem;
}

.filter-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--va-primary);
}

.reset-btn {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.filter-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.filter-section:last-of-type {
  border-bottom: none;
}

.filter-section-header {
  padding: 1.25rem 1.5rem 0.75rem;
  background: rgba(var(--va-background-secondary-rgb), 0.3);
}

.filter-subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: var(--va-text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-content {
  padding: 0.75rem 1.5rem 1.5rem;
}

/* 分类筛选 */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  --va-badge-text-wrapper-border-radius: 50%;
}

.category-item {
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  box-sizing: border-box;
}

.category-item .va-badge {
  aspect-ratio: 1 / 1;
}

.category-item:hover {
  background: rgba(var(--va-primary-rgb), 0.05);
  border-color: rgba(var(--va-primary-rgb), 0.2);
}

.category-item.active {
  background: rgba(var(--va-primary-rgb), 0.1);
  border-color: var(--va-primary);
  color: var(--va-primary);
}

.category-name {
  font-size: 0.9rem;
  font-weight: 500;
}

/* 价格筛选 */
.price-filter {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-input {
  flex: 1;
  min-width: 0;
}

.price-separator {
  font-weight: 500;
  color: var(--va-text-secondary);
  padding: 0;
  flex-shrink: 0;
  font-size: 0.85rem;
}

.price-symbol {
  font-size: 0.9rem;
  color: var(--va-text-secondary);
  font-weight: 500;
}

.price-shortcuts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.price-shortcut {
  font-size: 0.75rem;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
  text-align: center;
  min-width: 0;
}

.price-shortcut:hover {
  background: var(--va-primary);
  color: white;
  border-color: var(--va-primary);
}

/* 主要内容区 */
.products-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.no-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 8px;
}

.no-products h3 {
  margin: 1rem 0 0.5rem;
  color: var(--va-text-primary);
}

.no-products p {
  color: var(--va-text-secondary);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .products-container {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: static;
    order: 2;
  }

  .products-main {
    order: 1;
  }

  .filter-header {
    padding: 1rem 1.5rem;
  }

  .filter-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .products-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .filters-container {
    border-radius: 12px;
  }

  .filter-content {
    padding: 0.5rem 1rem 1rem;
  }

  .filter-section-header {
    padding: 1rem 1rem 0.5rem;
  }

  .price-shortcuts {
    grid-template-columns: 1fr;
  }

  .category-item {
    padding: 0.5rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.5rem;
  }

  .products-container {
    gap: 1rem;
  }

  .filter-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .reset-btn {
    align-self: flex-end;
  }

  .price-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .price-separator {
    display: none;
  }
}
</style>
