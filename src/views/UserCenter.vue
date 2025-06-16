<template>
  <div class="user-center">
    <div class="container">
      <div class="user-layout">
        <!-- 侧边栏导航 -->
        <aside class="user-sidebar">
          <va-card>
            <va-card-content>
              <div class="user-profile">
                <va-avatar
                  :src="userStore.user?.avatar"
                  :fallback-text="userStore.user?.username?.[0]"
                  size="large"
                />
                <h3>{{ userStore.user?.username }}</h3>
                <p>{{ userStore.user?.email }}</p>
              </div>

              <va-divider />

              <nav class="user-nav">
                <router-link to="/user/profile" class="nav-item">
                  <va-icon name="person" />
                  个人信息
                </router-link>
                <router-link to="/user/orders" class="nav-item">
                  <va-icon name="receipt" />
                  我的订单
                </router-link>
                <router-link to="/user/addresses" class="nav-item">
                  <va-icon name="location_on" />
                  收货地址
                </router-link>
              </nav>
            </va-card-content>
          </va-card>
        </aside>

        <!-- 主要内容区 -->
        <main class="user-main">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  padding: 2rem 0;
  background-color: var(--va-background-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.user-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

.user-sidebar {
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.user-profile {
  text-align: center;
  margin-bottom: 1rem;
}

.user-profile h3 {
  margin: 1rem 0 0.5rem 0;
  color: var(--va-text-primary);
}

.user-profile p {
  margin: 0;
  color: var(--va-text-secondary);
  font-size: 0.9rem;
}

.user-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--va-text-primary);
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  background-color: var(--va-primary-light);
  color: var(--va-primary);
}

.user-main {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  min-height: 400px;
}

@media (max-width: 768px) {
  .user-layout {
    grid-template-columns: 1fr;
  }

  .user-sidebar {
    position: static;
  }

  .user-main {
    padding: 1rem;
  }
}
</style>
