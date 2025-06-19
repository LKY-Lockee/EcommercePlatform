import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue'),
    },
    {
      path: '/product/:id',
      name: 'productDetail',
      component: () => import('@/views/ProductDetailView.vue'),
    },
    {
      path: '/category/:id',
      name: 'category',
      component: () => import('@/views/CategoryView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/payment/:id',
      name: 'payment',
      component: () => import('@/views/PaymentView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/UserCenter.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'profile',
          name: 'userProfile',
          component: () => import('@/views/user/ProfileView.vue'),
        },
        {
          path: 'orders',
          name: 'userOrders',
          component: () => import('@/views/user/OrdersView.vue'),
        },
        {
          path: 'addresses',
          name: 'userAddresses',
          component: () => import('@/views/user/AddressesView.vue'),
        },
      ],
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'adminDashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
        },
        {
          path: 'products',
          name: 'adminProducts',
          component: () => import('@/views/admin/ProductsView.vue'),
        },
        {
          path: 'categories',
          name: 'adminCategories',
          component: () => import('@/views/admin/CategoriesView.vue'),
        },
        {
          path: 'users',
          name: 'adminUsers',
          component: () => import('@/views/admin/UsersView.vue'),
        },
        {
          path: 'orders',
          name: 'adminOrders',
          component: () => import('@/views/admin/OrdersView.vue'),
        },
      ],
    },
  ],
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
