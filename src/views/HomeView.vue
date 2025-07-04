<template>
  <div class="home-view">
    <!-- 轮播图 -->
    <section class="hero-section">
      <va-carousel
        v-if="bannerItems.length > 0"
        v-model="currentSlide"
        :items="bannerItems"
        height="500px"
        fade
        autoplay
        :autoplay-timeout="2500"
      >
        <template #default="{ item }">
          <div class="banner-slide" :style="{ backgroundImage: `url(${item.image_url})` }">
            <div class="banner-content">
              <h1 class="banner-title">{{ item.title }}</h1>
              <p class="banner-subtitle">{{ item.subtitle || '' }}</p>
              <va-button
                size="large"
                color="primary"
                @click="$router.push(item.link || '/products')"
              >
                查看详情
              </va-button>
            </div>
          </div>
        </template>
      </va-carousel>

      <!-- 加载中状态 -->
      <div v-else class="banner-loading">
        <va-skeleton height="400px" />
      </div>
    </section>

    <!-- 商品分类 -->
    <section class="categories-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">商品分类</h2>
          <p class="section-subtitle">探索我们的精选商品分类</p>
        </div>
        <div class="categories-grid">
          <va-card
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            hover
            @click="$router.push(`/category/${category.id}`)"
          >
            <va-card-content>
              <div class="category-image">
                <va-avatar
                  :src="category.image"
                  size="3rem"
                  :fallback-text="category.name[0]"
                  color="primary"
                />
              </div>
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-description">{{ category.description }}</p>
              <div class="category-arrow">
                <va-icon name="arrow_forward" size="small" />
              </div>
            </va-card-content>
          </va-card>
        </div>
      </div>
    </section>

    <!-- 推荐商品 -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">推荐商品</h2>
          <p class="section-subtitle">精心挑选的优质商品</p>
        </div>
        <div class="products-grid">
          <ProductCard v-for="product in featuredProducts" :key="product.id" :product="product" />
        </div>
        <div class="section-footer">
          <va-button
            outline
            size="large"
            @click="$router.push('/products')"
            icon-right="arrow_forward"
          >
            查看更多商品
          </va-button>
        </div>
      </div>
    </section>

    <!-- 服务特色 -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <va-icon name="local_shipping" size="3rem" color="primary" />
            <h3>免费配送</h3>
            <p>满99元免费配送，快速到达</p>
          </div>
          <div class="feature-item">
            <va-icon name="verified_user" size="3rem" color="primary" />
            <h3>品质保证</h3>
            <p>正品保证，假一赔十</p>
          </div>
          <div class="feature-item">
            <va-icon name="support_agent" size="3rem" color="primary" />
            <h3>客服支持</h3>
            <p>7×24小时在线客服</p>
          </div>
          <div class="feature-item">
            <va-icon name="autorenew" size="3rem" color="primary" />
            <h3>退换无忧</h3>
            <p>7天无理由退换货</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCategories } from '@/api/category'
import { getProducts } from '@/api/product'
import { getBanners } from '@/api/banner'
import type { Category, Product, Banner } from '@/types'
import ProductCard from '@/components/ProductCard.vue'

// 响应式数据
const currentSlide = ref(0)
const categories = ref<Category[]>([])
const featuredProducts = ref<Product[]>([])
const bannerItems = ref<Banner[]>([])

// 加载轮播图数据
const loadBanners = async () => {
  try {
    const response = await getBanners()
    const bannersData = response.data
    if (Array.isArray(bannersData)) {
      bannerItems.value = bannersData
    } else {
      bannerItems.value = []
    }
  } catch (error) {
    console.error('加载轮播图失败:', error)
    bannerItems.value = []
  }
}

// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await getCategories()
    const categoriesData = response.data
    if (Array.isArray(categoriesData)) {
      categories.value = categoriesData.slice(0, 8)
    } else {
      categories.value = []
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    categories.value = []
  }
}

// 加载推荐商品
const loadFeaturedProducts = async () => {
  try {
    const response = await getProducts({
      featured: true,
      limit: 8,
      sort_by: 'rating',
      sort_order: 'desc',
    })

    const responseData = response.data.items
    if (responseData && Array.isArray(responseData)) {
      featuredProducts.value = responseData
    } else {
      featuredProducts.value = []
    }
  } catch (error) {
    console.error('加载推荐商品失败:', error)
    featuredProducts.value = []
  }
}

// 初始化数据
onMounted(() => {
  loadBanners()
  loadCategories()
  loadFeaturedProducts()
})
</script>

<style scoped>
/* 基础布局 */
.home-view {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 区块头部 */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--va-text-primary);
  background: linear-gradient(135deg, var(--va-primary), var(--va-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--va-text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 轮播图区域 */
.hero-section {
  margin: 2rem 2rem 5rem;
}

.banner-loading {
  border-radius: 16px;
  overflow: hidden;
}

.banner-slide {
  position: relative;
  width: 100%;
  height: 500px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  overflow: hidden;
}

.banner-slide::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
  backdrop-filter: blur(1px);
}

.banner-content {
  position: relative;
  text-align: center;
  color: white;
  z-index: 1;
  max-width: 600px;
  padding: 2rem;
}

.banner-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  font-weight: 300;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 商品分类区域 */
.categories-section {
  margin-bottom: 5rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.category-card {
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  border-radius: 16px;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.category-card:hover .category-arrow {
  opacity: 1;
}

.category-image {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.category-name {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--va-text-primary);
}

.category-description {
  color: var(--va-text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.category-arrow {
  color: var(--va-primary);
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* 推荐商品区域 */
.featured-section {
  margin-bottom: 5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.section-footer {
  text-align: center;
}

/* 服务特色区域 */
.features-section {
  background: var(--va-background-secondary);
  padding: 5rem 0;
  border-radius: 24px 24px 0 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
}

.feature-item {
  text-align: center;
  padding: 2.5rem 2rem;
  background: var(--va-background-primary);
  border-radius: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.feature-item h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem;
  color: var(--va-text-primary);
}

.feature-item p {
  color: var(--va-text-secondary);
  line-height: 1.6;
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-title {
    font-size: 2rem;
  }

  .banner-subtitle {
    font-size: 1.2rem;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
