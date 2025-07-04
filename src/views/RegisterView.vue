<template>
  <div class="register-view">
    <div class="register-container">
      <div class="register-card">
        <div class="card-header">
          <h2 class="register-title">创建新账户</h2>
          <p class="register-subtitle">开始您的购物之旅</p>
        </div>

        <div class="card-body">
          <va-form ref="formRef" @submit.prevent="handleRegister" class="register-form">
            <div class="form-row">
              <label class="form-label">用户名</label>
              <va-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                :rules="[required, usernameRule]"
              >
                <template #prependInner>
                  <va-icon name="person" />
                </template>
              </va-input>
            </div>

            <div class="form-row">
              <label class="form-label">邮箱地址</label>
              <va-input
                v-model="registerForm.email"
                placeholder="your@email.com"
                :rules="[required, emailRule]"
              >
                <template #prependInner>
                  <va-icon name="email" />
                </template>
              </va-input>
            </div>

            <div class="form-row">
              <label class="form-label">手机号 <span class="optional">(可选)</span></label>
              <va-input
                v-model="registerForm.phone"
                placeholder="请输入手机号"
                :rules="[phoneRule]"
              >
                <template #prependInner>
                  <va-icon name="phone" />
                </template>
              </va-input>
            </div>

            <div class="form-row">
              <label class="form-label">密码</label>
              <va-input
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                :rules="[required, passwordRule]"
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

            <div class="form-row">
              <label class="form-label">确认密码</label>
              <va-input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请再次输入密码"
                :rules="[required, confirmPasswordRule]"
              >
                <template #prependInner>
                  <va-icon name="lock" />
                </template>
                <template #appendInner>
                  <va-icon
                    :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="password-toggle"
                  />
                </template>
              </va-input>
            </div>

            <va-button type="submit" :loading="loading" block size="large"> 创建账户 </va-button>
          </va-form>

          <div class="register-footer">
            <p>
              已有账户？
              <va-button preset="plain" @click="$router.push('/login')"> 立即登录 </va-button>
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
import type { RegisterData } from '@/types'
import { useToast } from 'vuestic-ui'

const router = useRouter()
const userStore = useUserStore()
const { notify } = useToast()

const registerForm = ref<RegisterData>({
  username: '',
  email: '',
  phone: '',
  password: '',
})

const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const formRef = ref()

// 验证规则
const required = (value: unknown) => {
  if (!value || String(value).trim() === '') {
    return '此字段是必填的'
  }
  return true
}

const usernameRule = (value: unknown) => {
  const str = String(value || '').trim()
  if (str.length < 3) return '用户名至少需要3个字符'
  if (str.length > 20) return '用户名不能超过20个字符'
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(str)) return '用户名只能包含字母、数字、下划线和中文'
  return true
}

const emailRule = (value: unknown) => {
  const str = String(value || '').trim()
  if (!str) return '邮箱是必填的'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str) || '请输入有效的邮箱地址'
}

const phoneRule = (value: unknown) => {
  const str = String(value || '').trim()
  if (!str) return true
  return /^1[3-9]\d{9}$/.test(str) || '请输入有效的手机号'
}

const passwordRule = (value: unknown) => {
  const str = String(value || '').trim()
  if (str.length < 6) return '密码至少需要6个字符'
  if (str.length > 50) return '密码不能超过50个字符'
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(str)) return '密码必须包含字母和数字'
  return true
}

const confirmPasswordRule = (value: unknown) => {
  const str = String(value || '').trim()
  return str === registerForm.value.password || '两次密码输入不一致'
}

const handleRegister = async () => {
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
    const result = await userStore.register(registerForm.value)
    if (result.success) {
      notify({
        message: '注册成功！',
        color: 'success',
      })
      router.push('/')
    } else {
      notify({
        message: result.message || '注册失败',
        color: 'danger',
      })
    }
  } catch {
    notify({
      message: '注册失败，请稍后重试',
      color: 'danger',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 2rem 1rem;
}

.register-container {
  width: 100%;
  max-width: 480px;
}

.register-card {
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

.register-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--va-text-primary);
}

.register-subtitle {
  color: var(--va-text-secondary);
  margin: 0;
  font-size: 1rem;
  font-weight: 400;
}

.card-body {
  padding: 2rem;
}

.register-form {
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

.optional {
  color: var(--va-text-secondary);
  font-weight: 400;
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

.register-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 640px) {
  .register-view {
    padding: 1rem 0.5rem;
  }

  .card-header {
    padding: 1.5rem;
  }

  .register-title {
    font-size: 1.5rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .form-row {
    margin-bottom: 1.25rem;
  }
}

@media (max-width: 480px) {
  .register-view {
    padding: 0.5rem;
  }

  .card-header {
    padding: 1.5rem 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .register-title {
    font-size: 1.25rem;
  }

  .register-subtitle {
    font-size: 0.875rem;
  }
}
</style>
