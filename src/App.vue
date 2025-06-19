<template>
  <div id="app">
    <AppHeader v-if="!isAdminRoute" />
    <main>
      <router-view />
    </main>
    <AppFooter v-if="!isAdminRoute" />
  </div>
</template>

<script setup lang="ts" name="App">
import { computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

onBeforeMount(async () => {
  userStore.initUser()
  if (userStore.isLoggedIn) {
    await cartStore.getCart()
  }
})
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

body {
  margin: 0;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Roboto',
    sans-serif;
}

* {
  box-sizing: border-box;
}
</style>
