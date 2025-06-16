<template>
  <header class="app-header">
    <va-navbar class="navbar" color="primary">
      <template #left>
        <router-link to="/" class="navbar-brand">
          <va-icon name="shopping_cart" size="large" />
          <span class="brand-text">电商平台</span>
        </router-link>
      </template>

      <template #center>
        <div class="search-container">
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
      </template>

      <template #right>
        <div class="navbar-actions">
          <!-- 购物车 -->
          <va-button class="cart-button" icon="shopping_cart" flat @click="$router.push('/cart')">
            <template v-if="cartStore.totalItems > 0">
              <va-badge :text="cartStore.totalItems.toString()" color="danger" class="cart-badge" />
            </template>
          </va-button>

          <!-- 用户菜单 -->
          <div v-if="userStore.isLoggedIn" class="user-menu">
            <va-dropdown>
              <template #anchor>
                <va-button flat class="user-button">
                  <va-avatar
                    :src="userStore.user?.avatar"
                    :fallback-text="userStore.user?.username?.[0]"
                    size="small"
                  />
                  <span class="username">{{ userStore.user?.username }}</span>
                  <va-icon name="keyboard_arrow_down" />
                </va-button>
              </template>

              <va-dropdown-content>
                <va-list>
                  <va-list-item @click="$router.push('/user/profile')">
                    <va-list-item-section>
                      <va-icon name="person" />
                    </va-list-item-section>
                    <va-list-item-section> 个人中心 </va-list-item-section>
                  </va-list-item>

                  <va-list-item @click="$router.push('/user/orders')">
                    <va-list-item-section>
                      <va-icon name="receipt" />
                    </va-list-item-section>
                    <va-list-item-section> 我的订单 </va-list-item-section>
                  </va-list-item>

                  <va-list-item v-if="userStore.isAdmin" @click="$router.push('/admin/dashboard')">
                    <va-list-item-section>
                      <va-icon name="admin_panel_settings" />
                    </va-list-item-section>
                    <va-list-item-section> 管理后台 </va-list-item-section>
                  </va-list-item>

                  <va-divider />

                  <va-list-item @click="handleLogout">
                    <va-list-item-section>
                      <va-icon name="logout" />
                    </va-list-item-section>
                    <va-list-item-section> 退出登录 </va-list-item-section>
                  </va-list-item>
                </va-list>
              </va-dropdown-content>
            </va-dropdown>
          </div>

          <!-- 登录注册按钮 -->
          <div v-else class="auth-buttons">
            <va-button flat @click="$router.push('/login')"> 登录 </va-button>
            <va-button @click="$router.push('/register')"> 注册 </va-button>
          </div>
        </div>
      </template>
    </va-navbar>

    <!-- 导航菜单 -->
    <nav class="main-nav">
      <va-navbar color="secondary" class="nav-container">
        <template #center>
          <div class="nav-links">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/products" class="nav-link">所有商品</router-link>
            <va-dropdown class="category-dropdown">
              <template #anchor>
                <span class="nav-link dropdown-trigger">
                  商品分类
                  <va-icon name="keyboard_arrow_down" size="small" />
                </span>
              </template>
              <va-dropdown-content>
                <va-list v-if="categories.length > 0">
                  <va-list-item
                    v-for="category in categories"
                    :key="category.id"
                    @click="$router.push(`/category/${category.id}`)"
                  >
                    <va-list-item-section>
                      {{ category.name }}
                    </va-list-item-section>
                  </va-list-item>
                </va-list>
                <div v-else class="no-categories">暂无分类</div>
              </va-dropdown-content>
            </va-dropdown>
          </div>
        </template>
      </va-navbar>
    </nav>
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar {
  padding: 0 1rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.brand-text {
  margin-left: 0.5rem;
}

.search-container {
  max-width: 500px;
  width: 100%;
}

.search-input {
  width: 100%;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cart-button {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.username {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.main-nav {
  background-color: var(--va-secondary);
}

.nav-container {
  padding: 0 1rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-trigger {
  cursor: pointer;
}

.category-dropdown {
  position: relative;
}

.no-categories {
  padding: 1rem;
  color: var(--va-text-secondary);
  text-align: center;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 0.5rem;
  }

  .search-container {
    max-width: 200px;
  }

  .nav-links {
    gap: 1rem;
  }

  .username {
    display: none;
  }
}
</style>
