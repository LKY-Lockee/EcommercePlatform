<template>
  <div class="category-view">
    <div class="container">
      <!-- 分类头部 -->
      <div class="page-header">
        <h1 class="page-title">{{ categoryName }}</h1>
        <div class="sort-controls">
          <div class="products-controls">
            <!-- 排序 -->
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
            <span class="results-count"> 共 {{ totalProducts }} 件商品 </span>
          </div>
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

            <!-- 搜索区域 -->
            <div class="filter-section">
              <div class="filter-section-header">
                <h4 class="filter-subtitle">
                  <va-icon name="search" size="1rem" />
                  商品搜索
                </h4>
              </div>
              <div class="filter-content">
                <va-input
                  v-model="searchQuery"
                  placeholder="搜索该分类下的商品..."
                  class="search-input"
                  @keyup.enter="handleSearch"
                >
                  <template #appendInner>
                    <va-button
                      class="search-btn-inner"
                      preset="plain"
                      @click="handleSearch"
                      icon="search"
                      size="small"
                      color="primary"
                    />
                  </template>
                </va-input>
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
                      @blur="applyPriceFilter"
                      @keyup.enter="applyPriceFilter"
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
                      @blur="applyPriceFilter"
                      @keyup.enter="applyPriceFilter"
                    >
                      <template #prependIcon>
                        <span class="price-symbol">¥</span>
                      </template>
                    </va-input>
                  </div>
                  <div class="price-shortcuts">
                    <va-button
                      v-for="range in priceRangeOptions"
                      :key="range.text"
                      size="small"
                      preset="outline"
                      class="price-shortcut"
                      @click="setPriceRange(range.value)"
                    >
                      {{ range.text }}
                    </va-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- 主要内容区 -->
        <main class="products-main">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <va-progress-circle indeterminate size="large" />
            <p class="loading-text">正在加载商品...</p>
          </div>

          <!-- 空状态 -->
          <div v-else-if="products.length === 0" class="empty-container">
            <va-icon name="inventory_2" size="4rem" color="secondary" />
            <h3 class="empty-title">暂无商品</h3>
            <p class="empty-description">该分类下暂时没有商品，请尝试其他分类或稍后再来看看</p>
            <va-button color="primary" @click="$router.push('/products')"> 浏览所有商品 </va-button>
          </div>

          <!-- 商品网格 -->
          <div v-else class="products-section">
            <div class="products-grid">
              <ProductCard v-for="product in products" :key="product.id" :product="product" />
            </div>

            <!-- 分页 -->
            <div v-if="totalPages > 1" class="pagination-container">
              <va-pagination
                v-model="currentPage"
                :pages="totalPages"
                :visible-pages="5"
                @update:modelValue="handlePageChange"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProducts, type Product, type ProductListParams } from '@/api/product'
import { getCategory } from '@/api/category'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()

const loading = ref(false)
const products = ref<Product[]>([])
const categoryName = ref('商品分类')
const categoryDescription = ref('')
const searchQuery = ref('')
const sortBy = ref('created_at')
const priceRange = ref({
  min: '',
  max: '',
})
const currentPage = ref(1)
const pageSize = ref(20)
const totalPages = ref(1)
const totalProducts = ref(0)

const sortOptions = [
  { text: '最新发布', value: 'created_at' },
  { text: '价格从低到高', value: 'price_asc' },
  { text: '价格从高到低', value: 'price_desc' },
  { text: '销量最高', value: 'sales' },
  { text: '评分最高', value: 'rating' },
]

const priceRangeOptions = [
  { text: '0-100元', value: '0-100' },
  { text: '100-500元', value: '100-500' },
  { text: '500-1000元', value: '500-1000' },
  { text: '1000-5000元', value: '1000-5000' },
  { text: '5000元以上', value: '5000-' },
]

const loadCategory = async () => {
  const categoryId = route.params.id as string
  if (categoryId) {
    try {
      const response = await getCategory(parseInt(categoryId))
      categoryName.value = response.data.name
      categoryDescription.value = response.data.description || ''
    } catch (error) {
      console.error('加载分类信息失败:', error)
    }
  }
}

const loadProducts = async () => {
  try {
    loading.value = true
    const categoryId = route.params.id as string

    const params: ProductListParams = {
      page: currentPage.value,
      limit: pageSize.value,
    }

    if (categoryId) {
      params.category_id = parseInt(categoryId)
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    if (sortBy.value !== 'created_at') {
      const [field, order] = sortBy.value.split('_')
      params.sort_by = field as 'created_at' | 'price' | 'sales' | 'rating'
      params.sort_order = order?.toUpperCase() as 'ASC' | 'DESC'
    }

    if (priceRange.value.min || priceRange.value.max) {
      if (priceRange.value.min && !isNaN(Number(priceRange.value.min))) {
        params.min_price = Number(priceRange.value.min)
      }
      if (priceRange.value.max && !isNaN(Number(priceRange.value.max))) {
        params.max_price = Number(priceRange.value.max)
      }
    }

    const response = await getProducts(params)
    products.value = response.data.products || response.data

    // 如果API返回分页信息
    if (response.data.pagination?.total) {
      totalProducts.value = response.data.pagination.total
      totalPages.value = Math.ceil(response.data.pagination.total / pageSize.value)
    } else {
      // 如果没有分页信息，使用返回的商品数量
      totalProducts.value = Array.isArray(response.data)
        ? response.data.length
        : response.data.products?.length || 0
      totalPages.value = 1
    }
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

const resetFilters = () => {
  searchQuery.value = ''
  sortBy.value = 'created_at'
  priceRange.value = { min: '', max: '' }
  currentPage.value = 1
  loadProducts()
}

const applyPriceFilter = () => {
  currentPage.value = 1
  loadProducts()
}

const setPriceRange = (value: string) => {
  if (value.includes('-')) {
    const [min, max] = value.split('-')
    priceRange.value.min = min || ''
    priceRange.value.max = max || ''
  } else {
    // 清空价格范围
    priceRange.value = { min: '', max: '' }
  }
  applyPriceFilter()
}

const handlePageChange = () => {
  loadProducts()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 监听路由变化
watch(
  () => route.params.id,
  () => {
    currentPage.value = 1
    loadCategory()
    loadProducts()
  },
)

onMounted(() => {
  loadCategory()
  loadProducts()
})
</script>

<style scoped>
.category-view {
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

.header-controls {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.products-controls {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.sort-label {
  font-weight: 600;
  color: var(--va-text-primary);
}

.sort-controls {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 1rem;
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
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
  color: white;
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

.search-input {
  width: 100%;
  margin-bottom: 4px;
}

.search-btn-inner {
  border-radius: 50%;
  transition: all 0.2s ease;
  margin-right: 4px;
}

.search-btn-inner:hover {
  background: var(--va-primary);
  color: white;
}

.filter-select {
  width: 100%;
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
  min-width: 0; /* 防止flex项目溢出 */
}

.price-separator {
  font-weight: 500;
  color: var(--va-text-secondary);
  padding: 0;
  flex-shrink: 0; /* 防止分隔符被压缩 */
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

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-text {
  margin-top: 16px;
  color: var(--va-text-secondary);
  font-size: 1rem;
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-title {
  margin: 24px 0 16px 0;
  color: var(--va-text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-description {
  color: var(--va-text-secondary);
  margin: 0 0 32px 0;
  line-height: 1.6;
  max-width: 400px;
}

/* 商品区域 */
.products-section {
  width: 100%;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .products-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .filters-sidebar {
    position: static;
    max-height: none;
    order: 2;
  }

  .products-main {
    order: 1;
  }
}

@media (max-width: 768px) {
  .category-view {
    padding: 16px 0;
  }

  .container {
    padding: 0 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .header-controls {
    justify-content: center;
  }

  .products-container {
    gap: 16px;
  }

  .filters-container {
    padding: 16px;
  }

  .products-main {
    padding: 16px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .price-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .price-separator {
    text-align: center;
    padding: 4px 0;
  }

  .price-shortcut {
    min-width: calc(50% - 3px);
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.25rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .price-shortcut {
    min-width: 100%;
  }
}
</style>
