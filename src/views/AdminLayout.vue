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
                  <span class="user-role">管理员</span>
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
                  <p class="user-header-email">
                    {{ userStore.user?.email || 'admin@example.com' }}
                  </p>
                </div>
              </div>

              <va-divider style="margin: 0" />

              <va-list class="user-menu-list">
                <va-list-item @click="$router.push('/')" class="menu-item">
                  <va-list-item-section avatar>
                    <div class="menu-icon">
                      <va-icon name="home" color="primary" />
                    </div>
                  </va-list-item-section>
                  <va-list-item-section>
                    <va-list-item-label class="menu-label">返回前台</va-list-item-label>
                    <va-list-item-label caption class="menu-caption"
                      >访问前台页面</va-list-item-label
                    >
                  </va-list-item-section>
                </va-list-item>

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

const titleMap: Record<string, string> = {
  '/admin/dashboard': '仪表盘',
  '/admin/products': '商品管理',
  '/admin/categories': '分类管理',
  '/admin/orders': '订单管理',
  '/admin/users': '用户管理',
}

const getPageTitle = () => titleMap[route.path] || '管理后台'

const handleLogout = async () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100vh;
  background: #f5f5f5;
}

.admin-sidebar {
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 0 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
  height: 70px;
  display: flex;
  align-items: center;
}

.admin-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--va-text-primary);
}

.admin-nav {
  flex: 1;
  padding: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--va-text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  font-weight: 500;
}

.nav-item:hover {
  background: #f0f0f0;
  color: var(--va-text-primary);
}

.nav-item.router-link-active {
  background: var(--va-primary);
  color: white;
}

.admin-main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  background: white;
  padding: 0.75rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--va-text-primary);
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
  padding: 0.15rem 0;
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

.admin-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: #f5f5f5;
}

@media (max-width: 768px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    display: none;
  }

  .admin-content {
    padding: 1rem;
  }

  .admin-header {
    padding: 1rem;
  }

  .user-profile {
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
  }

  .user-info {
    display: none;
  }

  .user-dropdown-header {
    padding: 1rem;
  }

  .user-dropdown {
    min-width: 250px;
  }
}
</style>
