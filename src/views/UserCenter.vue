<template>
  <div class="user-center">
    <div class="container">
      <div class="user-layout">
        <!-- 侧边栏导航 -->
        <aside class="user-sidebar">
          <va-card class="sidebar-card">
            <va-card-content>
              <div class="user-profile">
                <div class="avatar-container">
                  <va-avatar
                    :src="userStore.user?.avatar"
                    :fallback-text="userStore.user?.username?.[0]"
                    size="4rem"
                    color="primary"
                  />
                </div>
                <div class="profile-info">
                  <h3 class="username">{{ userStore.user?.username }}</h3>
                  <p class="user-email">{{ userStore.user?.email }}</p>
                  <va-chip size="small" color="primary" outline>
                    {{ userStore.isAdmin ? '管理员' : '普通用户' }}
                  </va-chip>
                </div>
              </div>

              <va-divider style="margin: 1.5rem 0" />

              <nav class="user-nav">
                <router-link to="/user/profile" class="nav-item">
                  <div class="nav-icon">
                    <va-icon name="person" />
                  </div>
                  <span class="nav-text">个人信息</span>
                  <va-icon name="chevron_right" size="small" class="nav-arrow" />
                </router-link>
                <router-link to="/user/orders" class="nav-item">
                  <div class="nav-icon">
                    <va-icon name="receipt_long" />
                  </div>
                  <span class="nav-text">我的订单</span>
                  <va-icon name="chevron_right" size="small" class="nav-arrow" />
                </router-link>
                <router-link to="/user/addresses" class="nav-item">
                  <div class="nav-icon">
                    <va-icon name="location_on" />
                  </div>
                  <span class="nav-text">收货地址</span>
                  <va-icon name="chevron_right" size="small" class="nav-arrow" />
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
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.user-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;
}

.user-sidebar {
  height: fit-content;
  position: sticky;
  top: 5rem;
}

.sidebar-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.user-profile {
  text-align: center;
  padding-top: 1rem;
  margin-bottom: 1rem;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.username {
  margin: 0;
  color: var(--va-text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.user-email {
  margin: 0;
  color: var(--va-text-secondary);
  font-size: 0.85rem;
}

.user-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: var(--va-text-primary);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
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

.nav-item:hover::before,
.nav-item.router-link-active::before {
  transform: scaleY(1);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  background: rgba(var(--va-background-secondary-rgb), 0.5);
  transition: all 0.3s ease;
}

.nav-text {
  flex: 1;
  font-weight: 500;
  font-size: 0.9rem;
}

.nav-arrow {
  color: var(--va-text-secondary);
  transition: all 0.3s ease;
  opacity: 0;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: linear-gradient(
    90deg,
    rgba(var(--va-primary-rgb), 0.08) 0%,
    rgba(var(--va-primary-rgb), 0.02) 100%
  );
  color: var(--va-primary);
  transform: translateX(4px);
}

.nav-item:hover .nav-icon,
.nav-item.router-link-active .nav-icon {
  background: rgba(var(--va-primary-rgb), 0.15);
  transform: scale(1.05);
}

.nav-item:hover .nav-arrow,
.nav-item.router-link-active .nav-arrow {
  opacity: 1;
  transform: translateX(2px);
}

.user-main {
  background: white;
  border-radius: 0.375rem;
  padding: 2rem;
  min-height: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

@media (max-width: 992px) {
  .user-layout {
    grid-template-columns: 280px 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .user-center {
    padding: 1rem 0;
  }

  .user-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .user-sidebar {
    position: static;
  }

  .user-main {
    padding: 1.5rem;
    border-radius: 8px;
  }

  .nav-item {
    padding: 1rem;
  }

  .nav-item:hover {
    transform: none;
  }

  .nav-arrow {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.5rem;
  }

  .user-main {
    padding: 1rem;
  }
}
</style>
