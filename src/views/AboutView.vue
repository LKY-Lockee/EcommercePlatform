<template>
  <div class="about-view">
    <div class="container">
      <div class="hero-section">
        <h1 class="page-title">关于我们</h1>
        <p class="page-subtitle">了解 ShopMart 的故事</p>
      </div>

      <div class="content-section">
        <div class="section">
          <h2>我们的使命</h2>
          <p>
            ShopMart 致力于为用户提供最优质的购物体验，精选全球好物，品质保证，服务至上。
            我们相信，每一次购物都应该是一次愉快的体验。
          </p>
        </div>

        <div class="section">
          <h2>我们的价值观</h2>
          <div class="values-grid">
            <div class="value-item">
              <va-icon name="verified" size="2rem" color="primary" />
              <h3>品质保证</h3>
              <p>严格的质量控制，确保每件商品都符合高标准</p>
            </div>
            <div class="value-item">
              <va-icon name="support_agent" size="2rem" color="primary" />
              <h3>优质服务</h3>
              <p>24/7 客户服务，随时为您解决问题</p>
            </div>
            <div class="value-item">
              <va-icon name="eco" size="2rem" color="primary" />
              <h3>环保理念</h3>
              <p>关注环境保护，推广可持续发展</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面组件
</script>

<style scoped>
.about-view {
  padding: 2rem 0;
  min-height: calc(100vh - 200px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-section {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin-bottom: 1rem;
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--va-text-secondary);
  margin: 0;
}

.content-section {
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 1.5rem;
}

.section p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--va-text-secondary);
  margin-bottom: 1rem;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.value-item {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  background: var(--va-background-secondary);
  transition: transform 0.2s ease;
}

.value-item:hover {
  transform: translateY(-4px);
}

.value-item h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 1rem 0 0.5rem;
}

.value-item p {
  font-size: 0.95rem;
  color: var(--va-text-secondary);
  margin: 0;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  color: var(--va-text-secondary);
}

@media (max-width: 768px) {
  .about-view {
    padding: 1rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .values-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .value-item {
    padding: 1.5rem;
  }
}
</style>
