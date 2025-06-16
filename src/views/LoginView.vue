<template>
  <div class="login-view">
    <div class="login-container">
      <va-card class="login-card">
        <va-card-content>
          <div class="login-header">
            <h1 class="login-title">欢迎回来</h1>
            <p class="login-subtitle">请登录您的账户</p>
          </div>

          <va-form @submit.prevent="handleLogin">
            <div class="form-group">
              <va-input
                v-model="loginForm.username"
                label="用户名或邮箱"
                placeholder="请输入用户名或邮箱"
                :rules="[required]"
                outline
                class="form-input"
              >
                <template #prependInner>
                  <va-icon name="person" />
                </template>
              </va-input>
            </div>

            <div class="form-group">
              <va-input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                label="密码"
                placeholder="请输入密码"
                :rules="[required]"
                outline
                class="form-input"
              >
                <template #prependInner>
                  <va-icon name="lock" />
                </template>
                <template #appendInner>
                  <va-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    @click="showPassword = !showPassword"
                    style="cursor: pointer"
                  />
                </template>
              </va-input>
            </div>

            <div class="form-options">
              <va-checkbox v-model="rememberMe" label="记住我" />
              <va-button flat size="small" @click="handleForgotPassword"> 忘记密码？ </va-button>
            </div>

            <va-button type="submit" class="login-button" size="large" :loading="loading">
              登录
            </va-button>
          </va-form>

          <div class="login-footer">
            <span>还没有账户？</span>
            <va-button flat @click="$router.push('/register')"> 立即注册 </va-button>
          </div>

          <va-divider>
            <span style="color: var(--va-text-secondary); font-size: 0.9rem">或</span>
          </va-divider>

          <div class="social-login">
            <va-button
              outline
              icon="wechat"
              class="social-button"
              @click="handleSocialLogin('wechat')"
            >
              微信登录
            </va-button>
            <va-button outline icon="qq" class="social-button" @click="handleSocialLogin('qq')">
              QQ登录
            </va-button>
          </div>
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: '',
})

const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)

const required = (value: string) => !!value || '此字段是必填的'

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    return
  }

  loading.value = true

  try {
    const result = await userStore.login(loginForm.value)

    if (result.success) {
      // 登录成功，跳转到首页或之前的页面
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/')
    } else {
      // 显示错误消息
      console.error('登录失败:', result.message)
    }
  } catch (error) {
    console.error('登录错误:', error)
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  // 处理忘记密码逻辑
  console.log('忘记密码')
}

const handleSocialLogin = (platform: string) => {
  // 处理第三方登录逻辑
  console.log('第三方登录:', platform)
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: var(--va-text-primary);
}

.login-subtitle {
  color: var(--va-text-secondary);
  margin: 0;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-input {
  width: 100%;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.login-button {
  width: 100%;
  margin-bottom: 1.5rem;
}

.login-footer {
  text-align: center;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.social-login {
  display: flex;
  gap: 1rem;
}

.social-button {
  flex: 1;
}

@media (max-width: 480px) {
  .login-view {
    padding: 0.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .social-login {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
