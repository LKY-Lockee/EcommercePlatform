<template>
  <div class="register-view">
    <div class="register-container">
      <va-card class="register-card">
        <va-card-content>
          <div class="register-header">
            <h1 class="register-title">创建账户</h1>
            <p class="register-subtitle">加入我们，开始购物之旅</p>
          </div>

          <va-form @submit.prevent="handleRegister">
            <div class="form-group">
              <va-input
                v-model="registerForm.username"
                label="用户名"
                placeholder="请输入用户名"
                :rules="[required, usernameRule]"
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
                v-model="registerForm.email"
                label="邮箱"
                placeholder="请输入邮箱地址"
                :rules="[required, emailRule]"
                outline
                class="form-input"
              >
                <template #prependInner>
                  <va-icon name="email" />
                </template>
              </va-input>
            </div>

            <div class="form-group">
              <va-input
                v-model="registerForm.phone"
                label="手机号"
                placeholder="请输入手机号（可选）"
                :rules="[phoneRule]"
                outline
                class="form-input"
              >
                <template #prependInner>
                  <va-icon name="phone" />
                </template>
              </va-input>
            </div>

            <div class="form-group">
              <va-input
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                label="密码"
                placeholder="请输入密码"
                :rules="[required, passwordRule]"
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

            <div class="form-group">
              <va-input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="确认密码"
                placeholder="请再次输入密码"
                :rules="[required, confirmPasswordRule]"
                outline
                class="form-input"
              >
                <template #prependInner>
                  <va-icon name="lock" />
                </template>
                <template #appendInner>
                  <va-icon
                    :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                    @click="showConfirmPassword = !showConfirmPassword"
                    style="cursor: pointer"
                  />
                </template>
              </va-input>
            </div>

            <div class="form-agreement">
              <va-checkbox v-model="agreeToTerms" :rules="[agreeRule]">
                我已阅读并同意
                <a href="#" class="terms-link">《用户协议》</a>
                和
                <a href="#" class="terms-link">《隐私政策》</a>
              </va-checkbox>
            </div>

            <va-button
              type="submit"
              class="register-button"
              size="large"
              :loading="loading"
              :disabled="!agreeToTerms"
            >
              注册
            </va-button>
          </va-form>

          <div class="register-footer">
            <span>已有账户？</span>
            <va-button flat @click="$router.push('/login')"> 立即登录 </va-button>
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

const registerForm = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
})

const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeToTerms = ref(false)
const loading = ref(false)

// 验证规则
const required = (value: string) => !!value || '此字段是必填的'

const usernameRule = (value: string) => {
  if (value.length < 3) return '用户名至少需要3个字符'
  if (value.length > 20) return '用户名不能超过20个字符'
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)) return '用户名只能包含字母、数字、下划线和中文'
  return true
}

const emailRule = (value: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value) || '请输入有效的邮箱地址'
}

const phoneRule = (value: string) => {
  if (!value) return true // 手机号是可选的
  const phonePattern = /^1[3-9]\d{9}$/
  return phonePattern.test(value) || '请输入有效的手机号'
}

const passwordRule = (value: string) => {
  if (value.length < 6) return '密码至少需要6个字符'
  if (value.length > 50) return '密码不能超过50个字符'
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) return '密码必须包含字母和数字'
  return true
}

const confirmPasswordRule = (value: string) => {
  return value === registerForm.value.password || '两次密码输入不一致'
}

const agreeRule = (value: boolean) => {
  return value || '请同意用户协议和隐私政策'
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const result = await userStore.register(registerForm.value)

    if (result.success) {
      // 注册成功，跳转到首页
      router.push('/')
    } else {
      // 显示错误消息
      console.error('注册失败:', result.message)
    }
  } catch (error) {
    console.error('注册错误:', error)
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  // 基本验证
  if (!registerForm.value.username || !registerForm.value.email || !registerForm.value.password) {
    return false
  }

  if (registerForm.value.password !== confirmPassword.value) {
    return false
  }

  if (!agreeToTerms.value) {
    return false
  }

  return true
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.register-container {
  width: 100%;
  max-width: 450px;
}

.register-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: var(--va-text-primary);
}

.register-subtitle {
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

.form-agreement {
  margin-bottom: 2rem;
}

.terms-link {
  color: var(--va-primary);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-button {
  width: 100%;
  margin-bottom: 1.5rem;
}

.register-footer {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@media (max-width: 480px) {
  .register-view {
    padding: 0.5rem;
  }

  .register-title {
    font-size: 1.5rem;
  }
}
</style>
