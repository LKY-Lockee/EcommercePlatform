<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2 class="admin-title">管理后台</h2>
      </div>

      <nav class="admin-nav">
        <router-link to="/admin/dashboard" class="nav-item">
          <va-icon name="dashboard" />
          <span>仪表盘</span>
        </router-link>

        <router-link to="/admin/products" class="nav-item">
          <va-icon name="inventory" />
          <span>商品管理</span>
        </router-link>

        <router-link to="/admin/categories" class="nav-item">
          <va-icon name="category" />
          <span>分类管理</span>
        </router-link>

        <router-link to="/admin/orders" class="nav-item">
          <va-icon name="receipt" />
          <span>订单管理</span>
        </router-link>

        <router-link to="/admin/users" class="nav-item">
          <va-icon name="people" />
          <span>用户管理</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主要内容区 -->
    <main class="admin-main">
      <!-- 顶部导航栏 -->
      <header class="admin-header">
        <div class="header-left">
          <h1 class="page-title">{{ getPageTitle() }}</h1>
        </div>

        <div class="header-right">
          <va-dropdown>
            <template #anchor>
              <va-button flat class="admin-user-button">
                <va-avatar
                  :src="userStore.user?.avatar"
                  :fallback-text="userStore.user?.username?.[0]"
                  size="small"
                />
                <span>{{ userStore.user?.username }}</span>
                <va-icon name="keyboard_arrow_down" />
              </va-button>
            </template>

            <va-dropdown-content>
              <va-list>
                <va-list-item @click="$router.push('/')">
                  <va-list-item-section>
                    <va-icon name="home" />
                  </va-list-item-section>
                  <va-list-item-section> 返回前台 </va-list-item-section>
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
      </header>

      <!-- 页面内容 -->
      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const getPageTitle = () => {
  const titleMap: Record<string, string> = {
    '/admin/dashboard': '仪表盘',
    '/admin/products': '商品管理',
    '/admin/categories': '分类管理',
    '/admin/orders': '订单管理',
    '/admin/users': '用户管理',
  }

  return titleMap[route.path] || '管理后台'
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100vh;
  background-color: var(--va-background-secondary);
}

.admin-sidebar {
  background: var(--va-primary);
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
}

.admin-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
  margin: 0 0.5rem;
  border-radius: 6px;
}

.nav-item:hover,
.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.admin-main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--va-background-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--va-text-primary);
}

.admin-user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .admin-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .admin-sidebar {
    position: fixed;
    top: 0;
    left: -250px;
    width: 250px;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
  }

  .admin-main {
    grid-row: 1 / -1;
  }

  .admin-content {
    padding: 1rem;
  }
}
</style>
