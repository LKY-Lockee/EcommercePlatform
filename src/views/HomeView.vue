<template>
  <div class="home-view">
    <!-- 轮播图 -->
    <section class="hero-section">
      <va-carousel
        v-model="currentSlide"
        :items="bannerItems"
        height="400px"
        fade
        autoplay
        :autoplay-timeout="5000"
      >
        <template #default="{ item }">
          <div class="banner-slide" :style="{ backgroundImage: `url(${item.image})` }">
            <div class="banner-content">
              <h1 class="banner-title">{{ item.title }}</h1>
              <p class="banner-subtitle">{{ item.subtitle }}</p>
              <va-button size="large" color="primary" @click="$router.push(item.link)">
                {{ item.buttonText }}
              </va-button>
            </div>
          </div>
        </template>
      </va-carousel>
    </section>

    <!-- 商品分类 -->
    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">商品分类</h2>
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
                <va-avatar :src="category.image" size="large" :fallback-text="category.name[0]" />
              </div>
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-description">{{ category.description }}</p>
            </va-card-content>
          </va-card>
        </div>
      </div>
    </section>

    <!-- 推荐商品 -->
    <section class="featured-section">
      <div class="container">
        <h2 class="section-title">推荐商品</h2>
        <div class="products-grid">
          <ProductCard v-for="product in featuredProducts" :key="product.id" :product="product" />
        </div>
        <div class="section-footer">
          <va-button outline size="large" @click="$router.push('/products')">
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
import { categoryAPI, type Category } from '@/api/category'
import { productAPI, type Product } from '@/api/product'
import ProductCard from '@/components/ProductCard.vue'

const currentSlide = ref(0)
const categories = ref<Category[]>([])
const featuredProducts = ref<Product[]>([])

const bannerItems = [
  {
    image: 'https://via.placeholder.com/1200x400/4f46e5/ffffff?text=夏季大促销',
    title: '夏季大促销',
    subtitle: '精选商品 5折起',
    buttonText: '立即抢购',
    link: '/products',
  },
  {
    image: 'https://via.placeholder.com/1200x400/059669/ffffff?text=新品上市',
    title: '新品上市',
    subtitle: '潮流时尚，引领风尚',
    buttonText: '查看新品',
    link: '/products?featured=true',
  },
  {
    image: 'https://via.placeholder.com/1200x400/dc2626/ffffff?text=品质保证',
    title: '品质保证',
    subtitle: '正品承诺，假一赔十',
    buttonText: '了解更多',
    link: '/products',
  },
]

const loadCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data.slice(0, 8) // 只显示前8个分类
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadFeaturedProducts = async () => {
  try {
    const response = await productAPI.getFeaturedProducts(8)
    featuredProducts.value = response.data.products
  } catch (error) {
    console.error('加载推荐商品失败:', error)
  }
}

onMounted(() => {
  loadCategories()
  loadFeaturedProducts()
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: var(--va-text-primary);
}

/* 轮播图样式 */
.hero-section {
  margin-bottom: 4rem;
}

.banner-slide {
  position: relative;
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-slide::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.banner-content {
  position: relative;
  text-align: center;
  color: white;
  z-index: 1;
}

.banner-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.banner-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

/* 分类样式 */
.categories-section {
  margin-bottom: 4rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.category-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  text-align: center;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-image {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.category-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--va-text-primary);
}

.category-description {
  color: var(--va-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

/* 推荐商品样式 */
.featured-section {
  margin-bottom: 4rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.section-footer {
  text-align: center;
}

/* 服务特色样式 */
.features-section {
  background-color: var(--va-background-secondary);
  padding: 4rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-item {
  text-align: center;
  padding: 2rem 1rem;
}

.feature-item h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  color: var(--va-text-primary);
}

.feature-item p {
  color: var(--va-text-secondary);
  line-height: 1.5;
}

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
