<template>
  <footer class="app-footer">
    <va-card color="primary" text-color="white">
      <va-card-content>
        <div class="footer-container">
          <div class="footer-section">
            <h3 class="footer-title">电商平台</h3>
            <p class="footer-description">致力于为用户提供优质的购物体验，精选商品，品质保证。</p>
            <div class="social-links">
              <va-button icon="facebook" flat color="white" size="small" />
              <va-button icon="twitter" flat color="white" size="small" />
              <va-button icon="instagram" flat color="white" size="small" />
            </div>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">购物指南</h4>
            <ul class="footer-links">
              <li><a href="#" class="footer-link">新用户注册</a></li>
              <li><a href="#" class="footer-link">购物流程</a></li>
              <li><a href="#" class="footer-link">支付方式</a></li>
              <li><a href="#" class="footer-link">配送说明</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">售后服务</h4>
            <ul class="footer-links">
              <li><a href="#" class="footer-link">退换货政策</a></li>
              <li><a href="#" class="footer-link">服务保障</a></li>
              <li><a href="#" class="footer-link">联系客服</a></li>
              <li><a href="#" class="footer-link">投诉建议</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">关于我们</h4>
            <ul class="footer-links">
              <li><a href="#" class="footer-link">公司介绍</a></li>
              <li><a href="#" class="footer-link">招聘信息</a></li>
              <li><a href="#" class="footer-link">联系我们</a></li>
              <li><a href="#" class="footer-link">隐私政策</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">联系方式</h4>
            <div class="contact-info">
              <div class="contact-item">
                <va-icon name="phone" size="small" />
                <span>400-123-4567</span>
              </div>
              <div class="contact-item">
                <va-icon name="email" size="small" />
                <span>service@ecommerce.com</span>
              </div>
              <div class="contact-item">
                <va-icon name="location_on" size="small" />
                <span>北京市朝阳区xxx街道</span>
              </div>
            </div>
          </div>
        </div>

        <va-divider color="white" style="margin: 2rem 0 1rem 0" />

        <div class="footer-bottom">
          <p class="copyright">
            © 2024 电商平台. 版权所有. |
            <a href="#" class="footer-link">服务条款</a> |
            <a href="#" class="footer-link">隐私政策</a>
          </p>
          <p class="icp">京ICP备xxxxxxxx号-1</p>
        </div>
      </va-card-content>
    </va-card>
  </footer>
</template>

<script setup lang="ts">
// Footer component logic here
</script>

<style scoped>
.app-footer {
  margin-top: auto;
}

.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  color: white;
}

.footer-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: white;
}

.footer-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  gap: 0.5rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-link:hover {
  color: white;
  text-decoration: underline;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.footer-bottom {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.copyright {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.icp {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .footer-section {
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }
}
</style>
