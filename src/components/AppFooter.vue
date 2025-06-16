<template>
  <footer class="app-footer">
    <div class="footer-main">
      <div class="footer-container">
        <!-- 品牌信息区域 -->
        <div class="footer-brand">
          <div class="brand-section">
            <div class="footer-logo">
              <va-icon name="storefront" size="2.5rem" color="primary" />
              <h3 class="footer-brand-name">ShopMart</h3>
            </div>
            <p class="footer-description">
              致力于为用户提供最优质的购物体验，精选全球好物，品质保证，服务至上。
            </p>
            <div class="social-section">
              <h4 class="social-title">关注我们</h4>
              <div class="social-links">
                <va-button
                  icon="facebook"
                  preset="plain"
                  color="primary"
                  class="social-btn"
                  @click="openSocial('facebook')"
                />
                <va-button
                  icon="twitter"
                  preset="plain"
                  color="primary"
                  class="social-btn"
                  @click="openSocial('twitter')"
                />
                <va-button
                  icon="instagram"
                  preset="plain"
                  color="primary"
                  class="social-btn"
                  @click="openSocial('instagram')"
                />
                <va-button
                  icon="wechat"
                  preset="plain"
                  color="primary"
                  class="social-btn"
                  @click="openSocial('wechat')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="footer-section">
          <h4 class="section-title">购物指南</h4>
          <ul class="footer-links">
            <li><router-link to="/guide/register" class="footer-link">新用户注册</router-link></li>
            <li><router-link to="/guide/shopping" class="footer-link">购物流程</router-link></li>
            <li><router-link to="/guide/payment" class="footer-link">支付方式</router-link></li>
            <li><router-link to="/guide/delivery" class="footer-link">配送说明</router-link></li>
            <li><router-link to="/guide/faq" class="footer-link">常见问题</router-link></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="section-title">售后服务</h4>
          <ul class="footer-links">
            <li><router-link to="/service/return" class="footer-link">退换货政策</router-link></li>
            <li><router-link to="/service/warranty" class="footer-link">质量保证</router-link></li>
            <li><router-link to="/service/contact" class="footer-link">联系客服</router-link></li>
            <li><router-link to="/service/feedback" class="footer-link">意见反馈</router-link></li>
            <li><router-link to="/service/repair" class="footer-link">维修服务</router-link></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="section-title">关于我们</h4>
          <ul class="footer-links">
            <li><router-link to="/about/company" class="footer-link">公司介绍</router-link></li>
            <li><router-link to="/about/careers" class="footer-link">加入我们</router-link></li>
            <li><router-link to="/about/news" class="footer-link">新闻动态</router-link></li>
            <li><router-link to="/about/investor" class="footer-link">投资者关系</router-link></li>
            <li>
              <router-link to="/about/responsibility" class="footer-link">社会责任</router-link>
            </li>
          </ul>
        </div>

        <!-- 联系信息 -->
        <div class="footer-section contact-section">
          <h4 class="section-title">联系我们</h4>
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-icon">
                <va-icon name="phone" color="primary" />
              </div>
              <div class="contact-details">
                <span class="contact-label">客服热线</span>
                <span class="contact-value">400-123-4567</span>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">
                <va-icon name="email" color="primary" />
              </div>
              <div class="contact-details">
                <span class="contact-label">邮箱</span>
                <span class="contact-value">service@shopmart.com</span>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">
                <va-icon name="schedule" color="primary" />
              </div>
              <div class="contact-details">
                <span class="contact-label">服务时间</span>
                <span class="contact-value">周一至周日 9:00-22:00</span>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">
                <va-icon name="location_on" color="primary" />
              </div>
              <div class="contact-details">
                <span class="contact-label">地址</span>
                <span class="contact-value">北京市朝阳区xxx大厦</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="footer-bottom">
      <div class="footer-bottom-container">
        <div class="copyright-section">
          <p class="copyright">© 2024 ShopMart 精品购物平台. 保留所有权利.</p>
          <div class="legal-links">
            <router-link to="/legal/terms" class="legal-link">服务条款</router-link>
            <span class="separator">|</span>
            <router-link to="/legal/privacy" class="legal-link">隐私政策</router-link>
            <span class="separator">|</span>
            <router-link to="/legal/cookies" class="legal-link">Cookie政策</router-link>
          </div>
        </div>

        <div class="certificates">
          <div class="cert-item">
            <va-icon name="verified" color="success" size="small" />
            <span>京ICP备xxxxxxxx号-1</span>
          </div>
          <div class="cert-item">
            <va-icon name="security" color="success" size="small" />
            <span>公安备案号xxxxxxxx</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const openSocial = (platform: string) => {
  // 这里可以添加打开社交媒体的逻辑
  console.log(`打开${platform}`)
}
</script>

<style scoped>
.app-footer {
  margin-top: auto;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-top: 1px solid var(--va-background-border);
}

.footer-main {
  padding: 3rem 0 2rem 0;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 3rem;
}

/* 品牌区域 */
.footer-brand {
  grid-column: 1;
}

.brand-section {
  max-width: 350px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.footer-brand-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--va-primary), var(--va-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-description {
  color: var(--va-text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.social-section {
  margin-top: 2rem;
}

.social-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  gap: 0.75rem;
}

.social-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  border: 1px solid var(--va-background-border);
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.3);
  border-color: var(--va-primary);
}

/* 链接区域 */
.footer-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 1.5rem;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 2rem;
  height: 2px;
  background: linear-gradient(135deg, var(--va-primary), var(--va-secondary));
  border-radius: 1px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-link {
  color: var(--va-text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;
}

.footer-link:hover {
  color: var(--va-primary);
  transform: translateX(5px);
}

.footer-link::before {
  content: '';
  position: absolute;
  left: -1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 1px;
  background: var(--va-primary);
  transition: width 0.3s ease;
}

.footer-link:hover::before {
  width: 0.5rem;
}

/* 联系信息区域 */
.contact-section {
  background: var(--va-background-primary);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--va-background-border);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.contact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: linear-gradient(
    135deg,
    rgba(var(--va-primary-rgb), 0.1),
    rgba(var(--va-secondary-rgb), 0.05)
  );
  border-radius: 8px;
  flex-shrink: 0;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-label {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  font-weight: 500;
}

.contact-value {
  font-size: 0.9rem;
  color: var(--va-text-primary);
  font-weight: 500;
}

/* 底部版权区域 */
.footer-bottom {
  background: var(--va-background-primary);
  border-top: 1px solid var(--va-background-border);
  padding: 1.5rem 0;
}

.footer-bottom-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.copyright {
  margin: 0;
  font-size: 0.85rem;
  color: var(--va-text-secondary);
}

.legal-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legal-link {
  color: var(--va-text-secondary);
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s ease;
}

.legal-link:hover {
  color: var(--va-primary);
}

.separator {
  color: var(--va-background-border);
  font-size: 0.8rem;
}

.certificates {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.cert-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--va-text-secondary);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .footer-container {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }

  .contact-section {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0 1rem;
  }

  .footer-main {
    padding: 2rem 0 1.5rem 0;
  }

  .footer-bottom-container {
    flex-direction: column;
    align-items: flex-start;
    padding: 0 1rem;
  }

  .certificates {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .brand-section {
    max-width: none;
  }

  .social-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-main {
    padding: 1.5rem 0 1rem 0;
  }

  .footer-container {
    padding: 0 0.5rem;
  }

  .footer-bottom-container {
    padding: 0 0.5rem;
  }

  .contact-section {
    padding: 1rem;
  }
}
</style>
