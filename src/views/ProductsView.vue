<template>
  <div class="products-view">
    <div class="container">
      <!-- 页面标题和筛选 -->
      <div class="page-header">
        <h1 class="page-title">商品列表</h1>
        <div class="search-controls">
          <va-input
            v-model="searchQuery"
            placeholder="搜索商品..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #appendIcon>
              <va-button icon="search" flat @click="handleSearch" />
            </template>
          </va-input>
        </div>
      </div>

      <div class="products-container">
        <!-- 侧边筛选栏 -->
        <aside class="filters-sidebar">
          <va-card>
            <va-card-content>
              <h3 class="filter-title">筛选条件</h3>

              <!-- 分类筛选 -->
              <div class="filter-section">
                <h4 class="filter-subtitle">商品分类</h4>
                <va-radio-group v-model="selectedCategory" direction="column">
                  <va-radio :option="null" label="全部分类" />
                  <va-radio
                    v-for="category in categories"
                    :key="category.id"
                    :option="category.id"
                    :label="category.name"
                  />
                </va-radio-group>
              </div>

              <!-- 价格筛选 -->
              <div class="filter-section">
                <h4 class="filter-subtitle">价格范围</h4>
                <div class="price-inputs">
                  <va-input
                    v-model="priceRange.min"
                    placeholder="最低价"
                    type="number"
                    size="small"
                  />
                  <span>-</span>
                  <va-input
                    v-model="priceRange.max"
                    placeholder="最高价"
                    type="number"
                    size="small"
                  />
                </div>
              </div>

              <!-- 品牌筛选 -->
              <div class="filter-section">
                <h4 class="filter-subtitle">品牌</h4>
                <va-checkbox-group v-model="selectedBrands" direction="column">
                  <va-checkbox
                    v-for="brand in popularBrands"
                    :key="brand"
                    :option="brand"
                    :label="brand"
                  />
                </va-checkbox-group>
              </div>

              <!-- 筛选按钮 -->
              <div class="filter-actions">
                <va-button @click="applyFilters" class="apply-btn"> 应用筛选 </va-button>
                <va-button flat @click="resetFilters"> 重置 </va-button>
              </div>
            </va-card-content>
          </va-card>
        </aside>

        <!-- 主要内容区 -->
        <main class="products-main">
          <!-- 排序和视图控制 -->
          <div class="products-controls">
            <div class="sort-controls">
              <span class="sort-label">排序：</span>
              <va-select
                v-model="sortBy"
                :options="sortOptions"
                placeholder="选择排序方式"
                text-by="text"
                value-by="value"
                @update:model-value="loadProducts"
              />
            </div>

            <div class="view-controls">
              <span class="results-count"> 共 {{ pagination.total }} 件商品 </span>
            </div>
          </div>

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
import { productAPI, type Product, type ProductListParams } from '@/api/product'
import { categoryAPI, type Category } from '@/api/category'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<number | null>(null)
const selectedBrands = ref<string[]>([])
const currentPage = ref(1)
const sortBy = ref('created_at_desc')

const priceRange = ref({
  min: '',
  max: '',
})

const pagination = ref({
  current_page: 1,
  per_page: 12,
  total: 0,
  total_pages: 1,
})

const sortOptions = [
  { text: '最新发布', value: 'created_at_desc' },
  { text: '价格从低到高', value: 'price_asc' },
  { text: '价格从高到低', value: 'price_desc' },
  { text: '销量最高', value: 'sales_desc' },
  { text: '评分最高', value: 'rating_desc' },
]

const popularBrands = [
  'Apple',
  '华为',
  '小米',
  'Nike',
  'Adidas',
  '优衣库',
  '戴森',
  '宜家',
  '兰蔻',
  'SK-II',
  '茅台',
  '三只松鼠',
]

const loadProducts = async () => {
  loading.value = true

  try {
    const [sortField, sortOrder] = sortBy.value.split('_')
    const params: ProductListParams = {
      page: currentPage.value,
      limit: pagination.value.per_page,
      sort_by: sortField as 'created_at' | 'price' | 'sales' | 'rating',
      sort_order: sortOrder.toUpperCase() as 'ASC' | 'DESC',
    }

    if (selectedCategory.value) {
      params.category_id = selectedCategory.value
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await productAPI.getProducts(params)
    products.value = response.data.products
    pagination.value = response.data.pagination
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

const applyFilters = () => {
  currentPage.value = 1
  loadProducts()
}

const resetFilters = () => {
  selectedCategory.value = null
  selectedBrands.value = []
  priceRange.value = { min: '', max: '' }
  searchQuery.value = ''
  currentPage.value = 1
  loadProducts()
}

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.search) {
      searchQuery.value = newQuery.search as string
    }
    if (newQuery.category) {
      selectedCategory.value = Number(newQuery.category)
    }
    loadProducts()
  },
  { immediate: false },
)

onMounted(() => {
  // 从路由参数初始化筛选条件
  if (route.query.search) {
    searchQuery.value = route.query.search as string
  }
  if (route.query.category) {
    selectedCategory.value = Number(route.query.category)
  }

  loadCategories()
  loadProducts()
})
</script>

<style scoped>
.products-view {
  min-height: 100vh;
  padding: 2rem 0;
  background-color: var(--va-background-secondary);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--va-text-primary);
  margin: 0;
}

.search-controls {
  display: flex;
  gap: 1rem;
}

.search-input {
  width: 300px;
}

.products-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

.filters-sidebar {
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.filter-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 1.5rem 0;
  color: var(--va-text-primary);
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-subtitle {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--va-text-primary);
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.apply-btn {
  width: 100%;
}

.products-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.products-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
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
  margin: 1rem 0 0.5rem 0;
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

@media (max-width: 1024px) {
  .products-container {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: static;
  }

  .search-input {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .products-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>
