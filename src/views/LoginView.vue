<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <h2 class="login-title">欢迎回来</h2>
          <p class="login-subtitle">登录您的账户继续购物</p>
        </div>

        <div class="card-body">
          <va-form ref="formRef" @submit.prevent="handleLogin" class="login-form">
            <div class="form-row">
              <label class="form-label">用户名或邮箱</label>
              <va-input
                v-model="loginForm.username"
                placeholder="请输入用户名或邮箱"
                :rules="[required]"
              >
                <template #prependInner>
                  <va-icon name="person" />
                </template>
              </va-input>
            </div>

            <div class="form-row">
              <label class="form-label">密码</label>
              <va-input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                :rules="[required]"
              >
                <template #prependInner>
                  <va-icon name="lock" />
                </template>
                <template #appendInner>
                  <va-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    @click="showPassword = !showPassword"
                    class="password-toggle"
                  />
                </template>
              </va-input>
            </div>

            <div class="form-options">
              <va-checkbox v-model="rememberMe" label="记住我" />
              <va-button preset="plain" size="small" @click="handleForgotPassword">
                忘记密码？
              </va-button>
            </div>

            <va-button type="submit" :loading="loading" block size="large"> 登录 </va-button>
          </va-form>

          <div class="login-footer">
            <p>
              还没有账户？
              <va-button preset="plain" @click="$router.push('/register')"> 立即注册 </va-button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { LoginData } from '@/types'
import { useToast } from 'vuestic-ui'

const router = useRouter()
const userStore = useUserStore()
const { notify } = useToast()

const loginForm = ref<LoginData>({
  username: '',
  password: '',
})

const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const formRef = ref()

// 验证规则
const required = (value: unknown) => {
  if (!value || String(value).trim() === '') {
    return '此字段是必填的'
  }
  return true
}

const handleLogin = async () => {
  // 验证表单
  const isValid = await formRef.value?.validate()
  if (!isValid) {
    notify({
      message: '请检查表单中的错误信息',
      color: 'danger',
    })
    return
  }

  loading.value = true
  try {
    const result = await userStore.login(loginForm.value)
    if (result.success) {
      notify({
        message: '登录成功！',
        color: 'success',
      })
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/')
    } else {
      notify({
        message: result.message || '登录失败',
        color: 'danger',
      })
    }
  } catch {
    notify({
      message: '登录失败，请稍后重试',
      color: 'danger',
    })
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  // TODO: 实现忘记密码功能
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 2rem 1rem;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.card-header {
  background: #fafafa;
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--va-text-primary);
}

.login-subtitle {
  color: var(--va-text-secondary);
  margin: 0;
  font-size: 1rem;
  font-weight: 400;
}

.card-body {
  padding: 2rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-row {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 0.5rem;
}

.form-row .va-input {
  width: 100%;
}

.form-row :deep(.va-input__wrapper) {
  width: 100%;
}

.form-row :deep(.va-input__container) {
  width: 100%;
}

.form-row :deep(.va-input__field) {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.form-row :deep(.va-input__field:focus) {
  background: white;
  border-color: var(--va-primary);
}

.password-toggle {
  cursor: pointer;
  color: var(--va-text-secondary);
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: var(--va-primary);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.login-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 640px) {
  .login-view {
    padding: 1rem 0.5rem;
  }

  .card-header {
    padding: 1.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .form-row {
    margin-bottom: 1.25rem;
  }

  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .login-view {
    padding: 0.5rem;
  }

  .card-header {
    padding: 1.5rem 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .login-title {
    font-size: 1.25rem;
  }

  .login-subtitle {
    font-size: 0.875rem;
  }
}
</style>
