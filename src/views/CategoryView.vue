<template>
  <div class="category-view">
    <va-container>
      <div class="category-header">
        <h1 class="category-title">{{ categoryName }}</h1>
        <p v-if="categoryDescription" class="category-description">
          {{ categoryDescription }}
        </p>
      </div>

      <!-- 筛选和排序 -->
      <va-card class="filter-card">
        <va-card-content>
          <va-row :gutter="16" align="center">
            <va-column :xs="12" :md="6">
              <va-input
                v-model="searchQuery"
                placeholder="搜索商品..."
                clearable
                @keyup.enter="handleSearch"
              >
                <template #prepend>
                  <va-icon name="search" />
                </template>
              </va-input>
            </va-column>
            <va-column :xs="6" :md="3">
              <va-select
                v-model="sortBy"
                label="排序"
                :options="sortOptions"
                @update:modelValue="loadProducts"
              />
            </va-column>
            <va-column :xs="6" :md="3">
              <va-select
                v-model="priceRange"
                label="价格区间"
                :options="priceRangeOptions"
                clearable
                @update:modelValue="loadProducts"
              />
            </va-column>
          </va-row>
        </va-card-content>
      </va-card>

      <!-- 商品列表 -->
      <div v-if="loading" class="loading-container">
        <va-progress-circle indeterminate />
        <p>加载中...</p>
      </div>

      <div v-else-if="products.length === 0" class="empty-container">
        <va-icon name="inventory_2" size="4rem" color="secondary" />
        <h3>暂无商品</h3>
        <p>该分类下暂时没有商品</p>
      </div>

      <div v-else class="products-grid">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination-container">
        <va-pagination
          v-model="currentPage"
          :pages="totalPages"
          @update:modelValue="handlePageChange"
        />
      </div>
    </va-container>
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
const priceRange = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalPages = ref(1)

const sortOptions = [
  { text: '最新上架', value: 'created_at' },
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

    if (priceRange.value) {
      const [min, max] = priceRange.value.split('-')
      if (min && !isNaN(Number(min))) params.min_price = Number(min)
      if (max && !isNaN(Number(max))) params.max_price = Number(max)
    }

    const response = await getProducts(params)
    products.value = response.data.products || response.data

    // 如果API返回分页信息
    if (response.data.pagination?.total) {
      totalPages.value = Math.ceil(response.data.pagination.total / pageSize.value)
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
  padding: 20px 0;
  min-height: 100vh;
}

.category-header {
  text-align: center;
  margin-bottom: 32px;
}

.category-title {
  font-size: 32px;
  font-weight: bold;
  color: var(--va-primary);
  margin-bottom: 8px;
}

.category-description {
  font-size: 16px;
  color: var(--va-secondary);
  margin: 0;
}

.filter-card {
  margin-bottom: 24px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-container p {
  margin-top: 16px;
  color: var(--va-secondary);
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-container h3 {
  margin: 16px 0 8px 0;
  color: var(--va-text-primary);
}

.empty-container p {
  color: var(--va-secondary);
  margin: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
