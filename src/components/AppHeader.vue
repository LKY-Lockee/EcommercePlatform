<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo区域 -->
      <router-link to="/" class="brand-logo">
        <div class="logo-icon">
          <va-icon name="storefront" size="1.8rem" color="primary" />
        </div>
        <h2 class="brand-name">ShopMart</h2>
      </router-link>

      <!-- 导航菜单 -->
      <nav class="main-nav">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/products" class="nav-link">全部商品</router-link>

        <va-dropdown placement="bottom-start">
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
                  <va-avatar :src="category.image" size="small" :fallback-text="category.name[0]" />
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

      <!-- 搜索栏 -->
      <div class="search-section">
        <va-input
          v-model="searchQuery"
          placeholder="搜索您想要的商品..."
          class="search-input"
          @keyup.enter="handleSearch"
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

      <!-- 用户操作区域 -->
      <div class="user-actions">
        <!-- 购物车 -->
        <va-button class="action-btn" preset="plain" @click="$router.push('/cart')">
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
                  size="2.2rem"
                  color="primary"
                  class="user-avatar"
                />
                <div class="user-info">
                  <span class="username">{{ userStore.user?.username }}</span>
                  <span class="user-role">{{ userStore.isAdmin ? '管理员' : '用户' }}</span>
                </div>
                <va-icon name="keyboard_arrow_down" size="small" class="dropdown-arrow" />
              </div>
            </template>

            <va-dropdown-content class="user-dropdown">
              <div class="user-dropdown-header">
                <va-avatar
                  :src="userStore.user?.avatar"
                  :fallback-text="userStore.user?.username?.[0]"
                  size="3rem"
                  color="primary"
                />
                <div class="user-header-info">
                  <h4 class="user-header-name">{{ userStore.user?.username }}</h4>
                  <p class="user-header-email">{{ userStore.user?.email }}</p>
                </div>
              </div>

              <va-divider style="margin: 0" />

              <va-list class="user-menu-list">
                <va-list-item @click="$router.push('/user/profile')" class="menu-item">
                  <va-list-item-section avatar>
                    <div class="menu-icon">
                      <va-icon name="person" color="primary" />
                    </div>
                  </va-list-item-section>
                  <va-list-item-section>
                    <va-list-item-label class="menu-label">个人中心</va-list-item-label>
                    <va-list-item-label caption class="menu-caption"
                      >管理个人信息</va-list-item-label
                    >
                  </va-list-item-section>
                </va-list-item>

                <va-list-item @click="$router.push('/user/orders')" class="menu-item">
                  <va-list-item-section avatar>
                    <div class="menu-icon">
                      <va-icon name="receipt_long" color="success" />
                    </div>
                  </va-list-item-section>
                  <va-list-item-section>
                    <va-list-item-label class="menu-label">我的订单</va-list-item-label>
                    <va-list-item-label caption class="menu-caption"
                      >查看订单历史</va-list-item-label
                    >
                  </va-list-item-section>
                </va-list-item>

                <va-list-item
                  v-if="userStore.isAdmin"
                  @click="$router.push('/admin/dashboard')"
                  class="menu-item admin-item"
                >
                  <va-list-item-section avatar>
                    <div class="menu-icon admin-icon">
                      <va-icon name="admin_panel_settings" color="warning" />
                    </div>
                  </va-list-item-section>
                  <va-list-item-section>
                    <va-list-item-label class="menu-label">管理后台</va-list-item-label>
                    <va-list-item-label caption class="menu-caption"
                      >系统管理面板</va-list-item-label
                    >
                  </va-list-item-section>
                </va-list-item>

                <va-divider style="margin: 0.75rem 0" />

                <va-list-item @click="handleLogout" class="menu-item logout-item">
                  <va-list-item-section avatar>
                    <div class="menu-icon logout-icon">
                      <va-icon name="logout" color="danger" />
                    </div>
                  </va-list-item-section>
                  <va-list-item-section>
                    <va-list-item-label class="menu-label logout-label"
                      >退出登录</va-list-item-label
                    >
                    <va-list-item-label caption class="menu-caption"
                      >安全退出账户</va-list-item-label
                    >
                  </va-list-item-section>
                </va-list-item>
              </va-list>
            </va-dropdown-content>
          </va-dropdown>
        </div>

        <!-- 登录注册按钮 -->
        <div v-else class="auth-section">
          <va-button preset="plain" @click="$router.push('/login')">登录</va-button>
          <va-button color="primary" @click="$router.push('/register')">注册</va-button>
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
import { getCategories } from '@/api/category'
import type { Category } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

// 响应式状态
const searchQuery = ref('')
const categories = ref<Category[]>([])

// 事件处理函数
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

// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

onMounted(loadCategories)
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
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

/* 搜索区域 */
.search-section {
  flex: 1;
  max-width: 500px;
  margin: 0 1rem;
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
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(
    135deg,
    rgba(var(--va-background-secondary-rgb), 0.5) 0%,
    rgba(var(--va-background-secondary-rgb), 0.3) 100%
  );
  position: relative;
  overflow: hidden;
}

.user-profile::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(var(--va-primary-rgb), 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-profile:hover {
  background: linear-gradient(
    135deg,
    rgba(var(--va-background-secondary-rgb), 0.8) 0%,
    rgba(var(--va-background-secondary-rgb), 0.6) 100%
  );
  border-color: var(--va-primary);
  box-shadow: 0 6px 20px rgba(var(--va-primary-rgb), 0.15);
  transform: translateY(-1px);
}

.user-profile:hover::before {
  opacity: 1;
}

.user-avatar {
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.user-avatar :deep(.va-avatar__content) {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.user-profile:hover .user-avatar {
  box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.2);
  transform: scale(1.05);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--va-text-primary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.user-role {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--va-primary);
  background: rgba(var(--va-primary-rgb), 0.12);
  padding: 0.15rem 0rem;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1;
}

.dropdown-arrow {
  transition: transform 0.3s ease;
  color: var(--va-text-secondary);
  flex-shrink: 0;
}

.user-profile:hover .dropdown-arrow {
  transform: rotate(180deg);
  color: var(--va-primary);
}

/* 用户下拉菜单样式 */
.user-dropdown {
  min-width: 280px;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  background: white;
  margin-top: 18px;
  backdrop-filter: blur(10px);
}

.user-dropdown-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--va-primary) 0%, rgba(var(--va-primary-rgb), 0.9) 100%);
  color: white;
  position: relative;
}

.user-dropdown-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="30" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="70" r="1.5" fill="rgba(255,255,255,0.1)"/></svg>');
  pointer-events: none;
}

.user-header-info {
  flex: 1;
  z-index: 1;
  position: relative;
}

.user-header-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: black;
}

.user-header-email {
  font-size: 0.85rem;
  margin: 0;
  color: black;
  font-weight: 400;
}

.user-menu-list {
  padding: 0.5rem 0;
}

.menu-item {
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--va-primary);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.menu-item:hover {
  background: linear-gradient(
    90deg,
    rgba(var(--va-primary-rgb), 0.08) 0%,
    rgba(var(--va-primary-rgb), 0.02) 100%
  );
  transform: translateX(4px);
}

.menu-item:hover::before {
  transform: scaleY(1);
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 10px;
  background: rgba(var(--va-background-secondary-rgb), 0.5);
  transition: all 0.3s ease;
}

.menu-item:hover .menu-icon {
  background: rgba(var(--va-primary-rgb), 0.15);
  transform: scale(1.1);
}

.menu-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--va-text-primary);
  transition: color 0.3s ease;
  line-height: 1.3;
}

.menu-caption {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  margin-top: 0.2rem;
  line-height: 1.2;
}

.logout-label {
  color: var(--va-danger);
}

.auth-section {
  display: flex;
  gap: 1rem;
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

  .user-info {
    display: none;
  }

  .user-profile {
    padding: 0.4rem 0.8rem;
    gap: 0.5rem;
  }

  .user-dropdown {
    min-width: 260px;
  }

  .user-dropdown-header {
    padding: 1.25rem;
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
