<template>
  <header class="app-header">
    <!-- 主导航栏 - 单行布局 -->
    <div class="main-header">
      <div class="header-container">
        <!-- Logo区域 -->
        <router-link to="/" class="brand-logo">
          <div class="logo-icon">
            <va-icon name="storefront" size="1.8rem" color="primary" />
          </div>
          <div class="brand-info">
            <h2 class="brand-name">ShopMart</h2>
          </div>
        </router-link>

        <!-- 导航菜单 -->
        <nav class="main-nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/products" class="nav-link">全部商品</router-link>

          <va-dropdown class="nav-dropdown" placement="bottom-start">
            <template #anchor>
              <div class="nav-link dropdown-trigger">
                <span>商品分类</span>
                <va-icon name="keyboard_arrow_down" size="small" />
              </div>
            </template>
            <va-dropdown-content class="category-menu">
              <va-list v-if="categories.length > 0">
                <va-list-item
                  v-for="category in categories"
                  :key="category.id"
                  @click="$router.push(`/category/${category.id}`)"
                  class="category-item"
                >
                  <va-list-item-section avatar>
                    <va-avatar
                      :src="category.image"
                      size="small"
                      :fallback-text="category.name[0]"
                    />
                  </va-list-item-section>
                  <va-list-item-section>
                    <va-list-item-label>{{ category.name }}</va-list-item-label>
                    <va-list-item-label caption>{{ category.description }}</va-list-item-label>
                  </va-list-item-section>
                </va-list-item>
              </va-list>
              <div v-else class="no-categories">
                <va-icon name="category" />
                <span>暂无分类</span>
              </div>
            </va-dropdown-content>
          </va-dropdown>

          <router-link to="/about" class="nav-link">关于我们</router-link>
        </nav>

        <!-- 搜索栏 - 合并的设计 -->
        <div class="search-section">
          <div class="search-container">
            <va-input
              v-model="searchQuery"
              placeholder="搜索您想要的商品..."
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

        <!-- 用户操作区域 -->
        <div class="user-actions">
          <!-- 购物车 -->
          <va-button class="action-btn cart-btn" preset="plain" @click="$router.push('/cart')">
            <va-icon name="shopping_cart" size="1.3rem" />
            <span class="action-text">购物车</span>
            <va-badge
              v-if="cartStore.totalItems > 0"
              :text="cartStore.totalItems.toString()"
              color="danger"
              class="cart-badge"
            />
          </va-button>

          <!-- 用户菜单 -->
          <div v-if="userStore.isLoggedIn" class="user-section">
            <va-dropdown placement="bottom-end">
              <template #anchor>
                <div class="user-profile">
                  <va-avatar
                    :src="userStore.user?.avatar"
                    :fallback-text="userStore.user?.username?.[0]"
                    size="2rem"
                    color="primary"
                  />
                  <span class="username">{{ userStore.user?.username }}</span>
                  <va-icon name="keyboard_arrow_down" size="small" />
                </div>
              </template>

              <va-dropdown-content class="user-dropdown">
                <va-list>
                  <va-list-item @click="$router.push('/user/profile')">
                    <va-list-item-section avatar>
                      <va-icon name="person" color="primary" />
                    </va-list-item-section>
                    <va-list-item-section>
                      <va-list-item-label>个人中心</va-list-item-label>
                    </va-list-item-section>
                  </va-list-item>

                  <va-list-item @click="$router.push('/user/orders')">
                    <va-list-item-section avatar>
                      <va-icon name="receipt_long" color="primary" />
                    </va-list-item-section>
                    <va-list-item-section>
                      <va-list-item-label>我的订单</va-list-item-label>
                    </va-list-item-section>
                  </va-list-item>

                  <va-list-item v-if="userStore.isAdmin" @click="$router.push('/admin/dashboard')">
                    <va-list-item-section avatar>
                      <va-icon name="admin_panel_settings" color="warning" />
                    </va-list-item-section>
                    <va-list-item-section>
                      <va-list-item-label>管理后台</va-list-item-label>
                    </va-list-item-section>
                  </va-list-item>

                  <va-divider style="margin: 0.5rem 0" />

                  <va-list-item @click="handleLogout">
                    <va-list-item-section avatar>
                      <va-icon name="logout" color="danger" />
                    </va-list-item-section>
                    <va-list-item-section>
                      <va-list-item-label>退出登录</va-list-item-label>
                    </va-list-item-section>
                  </va-list-item>
                </va-list>
              </va-dropdown-content>
            </va-dropdown>
          </div>

          <!-- 登录注册按钮 -->
          <div v-else class="auth-section">
            <va-button preset="plain" @click="$router.push('/login')"> 登录 </va-button>
            <va-button color="primary" @click="$router.push('/register')"> 注册 </va-button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { categoryAPI, type Category } from '@/api/category'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const searchQuery = ref('')
const categories = ref<Category[]>([])

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'products',
      query: { search: searchQuery.value },
    })
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}

const loadCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

/* 主Header样式 - 单行布局 */
.main-header {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 70px;
}

/* Logo区域 */
.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.brand-logo:hover {
  transform: scale(1.02);
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.25);
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--va-text-primary);
  background: var(--va-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 主导航菜单 */
.main-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--va-text-primary);
  font-weight: 500;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--va-primary);
  background: rgba(var(--va-primary-rgb), 0.08);
}

.nav-link.router-link-active {
  color: var(--va-primary);
  background: rgba(var(--va-primary-rgb), 0.12);
}

.dropdown-trigger {
  cursor: pointer;
}

/* 搜索区域 - 合并设计 */
.search-section {
  flex: 1;
  max-width: 500px;
  margin: 0 1rem;
}

.search-container {
  position: relative;
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

.search-btn-inner {
  border-radius: 50%;
  transition: all 0.2s ease;
  margin-right: 4px;
}

.search-btn-inner:hover {
  background: var(--va-primary);
  color: white;
}

/* 用户操作区域 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(var(--va-background-secondary-rgb), 0.3);
  position: relative;
}

.action-btn:hover {
  background: var(--va-background-secondary);
  border-color: var(--va-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-text {
  font-size: 0.85rem;
  font-weight: 500;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  font-size: 0.7rem;
}

/* 用户资料区域 */
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(var(--va-background-secondary-rgb), 0.3);
}

.user-profile:hover {
  background: var(--va-background-secondary);
  border-color: var(--va-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.username {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--va-text-primary);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-section {
  display: flex;
  gap: 1.5rem;
}

/* 下拉菜单样式 */
.category-menu {
  min-width: 250px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  background: white;
  margin-top: 28px;
}

.category-item {
  transition: background 0.2s ease;
  padding: 8px 16px;
}

.category-item:hover {
  background: var(--va-background-secondary);
}

.no-categories {
  padding: 2rem;
  text-align: center;
  color: var(--va-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-container {
    padding: 0.75rem 1rem;
    gap: 1rem;
  }

  .search-section {
    max-width: 400px;
  }
}

@media (max-width: 992px) {
  .main-nav {
    display: none;
  }

  .search-section {
    max-width: 300px;
  }

  .action-text {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-container {
    gap: 0.5rem;
    padding: 0.5rem 1rem;
  }

  .brand-name {
    font-size: 1.1rem;
  }

  .logo-icon {
    width: 2rem;
    height: 2rem;
  }

  .search-section {
    max-width: 200px;
  }

  .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0.5rem;
    gap: 0.25rem;
  }

  .search-section {
    max-width: 150px;
  }

  .user-actions {
    gap: 0.5rem;
  }
}
</style>
