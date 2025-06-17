<template>
  <div class="profile-view">
    <h2 class="page-title">个人信息</h2>

    <!-- 基本信息 -->
    <div class="form-section">
      <h3 class="section-title">基本信息</h3>
      <va-form ref="profileFormRef" @submit.prevent="handleSave">
        <div class="form-grid">
          <va-input v-model="profileForm.username" label="用户名" :rules="[required]" outline />
          <va-input
            v-model="profileForm.email"
            label="邮箱"
            type="email"
            :rules="[required, emailRule]"
            outline
          />
          <va-input v-model="profileForm.phone" label="手机号" outline />
          <va-input
            v-model="profileForm.avatar"
            label="头像URL"
            outline
            placeholder="请输入头像图片链接"
          />
        </div>

        <div v-if="profileForm.avatar" class="avatar-preview">
          <span class="preview-label">头像预览：</span>
          <va-avatar
            :src="profileForm.avatar"
            :fallback-text="profileForm.username?.[0]"
            size="large"
          />
        </div>

        <div class="form-actions">
          <va-button type="submit" :loading="saving">保存修改</va-button>
          <va-button flat @click="resetProfileForm">重置</va-button>
        </div>
      </va-form>
    </div>

    <va-divider />

    <!-- 修改密码 -->
    <div class="form-section">
      <h3 class="section-title">修改密码</h3>
      <va-form ref="passwordFormRef" @submit.prevent="handleChangePassword">
        <div class="form-grid">
          <va-input
            v-model="passwordForm.currentPassword"
            label="当前密码"
            type="password"
            :rules="[required]"
            outline
            class="full-width"
          />
          <va-input
            v-model="passwordForm.newPassword"
            label="新密码"
            type="password"
            :rules="[required, passwordRule]"
            outline
          />
          <va-input
            v-model="passwordForm.confirmPassword"
            label="确认新密码"
            type="password"
            :rules="[required, confirmPasswordRule]"
            outline
          />
        </div>

        <div class="form-actions">
          <va-button type="submit" :loading="changingPassword">修改密码</va-button>
          <va-button flat @click="resetPasswordForm">清空</va-button>
        </div>
      </va-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { userAPI } from '@/api/user'
import { useToast } from 'vuestic-ui'

const userStore = useUserStore()
const { notify } = useToast()
const profileFormRef = ref()
const passwordFormRef = ref()

const profileForm = ref({
  username: '',
  email: '',
  phone: '',
  avatar: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const saving = ref(false)
const changingPassword = ref(false)

// 验证规则
const required = (value: unknown) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return '此字段是必填的'
  }
  return true
}

const emailRule = (value: unknown) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return '邮箱是必填的'
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(String(value)) || '请输入有效的邮箱地址'
}

const passwordRule = (value: unknown) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return '密码是必填的'
  }
  if (String(value).length < 6) {
    return '密码至少需要6个字符'
  }
  return true
}

const confirmPasswordRule = (value: unknown) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return '请确认密码'
  }
  return String(value) === passwordForm.value.newPassword || '两次密码输入不一致'
}

const initProfileForm = () => {
  console.log('初始化表单，用户信息:', userStore.user)

  if (userStore.user) {
    profileForm.value = {
      username: userStore.user.username || '',
      email: userStore.user.email || '',
      phone: userStore.user.phone || '',
      avatar: userStore.user.avatar || '',
    }
  } else {
    // 如果没有用户信息，尝试从localStorage获取
    const savedUser = localStorage.getItem('user')
    console.log('从localStorage获取用户信息:', savedUser)

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        profileForm.value = {
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
        }
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    } else {
      // 如果没有任何用户信息，使用测试数据（仅开发环境）
      if (import.meta.env.DEV) {
        console.log('开发环境下设置测试用户数据')
        const testUser = {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          phone: '13800138000',
          avatar: '',
          role: 'user',
        }

        // 设置到store和localStorage
        userStore.user = testUser
        localStorage.setItem('user', JSON.stringify(testUser))
        localStorage.setItem('token', 'test-token')

        profileForm.value = {
          username: testUser.username,
          email: testUser.email,
          phone: testUser.phone,
          avatar: testUser.avatar,
        }
      }
    }
  }

  console.log('表单初始化完成:', profileForm.value)
}

const resetProfileForm = () => {
  initProfileForm()
  // 重置表单验证状态
  profileFormRef.value?.resetValidation?.()
}

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  // 重置表单验证状态
  passwordFormRef.value?.resetValidation?.()
}

const handleSave = async () => {
  console.log('开始保存，表单数据:', profileForm.value)

  // 验证表单
  const isValid = await profileFormRef.value?.validate()
  console.log('表单验证结果:', isValid)

  if (!isValid) {
    return
  }

  saving.value = true

  try {
    // 调用真实API
    const result = await userStore.updateProfile(profileForm.value)
    console.log('API调用结果:', result)

    if (result.success) {
      notify({
        message: '个人信息更新成功',
        color: 'success',
      })
    } else {
      notify({
        message: result.message || '更新失败',
        color: 'danger',
      })
    }
  } catch (error) {
    console.error('API调用错误:', error)
    notify({
      message: '更新个人信息失败，请检查网络连接',
      color: 'danger',
    })
  } finally {
    saving.value = false
  }
}

const handleChangePassword = async () => {
  // 验证表单
  const isValid = await passwordFormRef.value?.validate()
  if (!isValid) {
    return
  }

  // 检查新密码与确认密码是否一致
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    notify({
      message: '两次密码输入不一致',
      color: 'warning',
    })
    return
  }

  changingPassword.value = true

  try {
    // 调用真实API
    await userAPI.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })

    notify({
      message: '密码修改成功',
      color: 'success',
    })
    // 清空密码表单
    resetPasswordForm()
  } catch (error) {
    console.error('修改密码失败:', error)
    notify({
      message: '修改密码失败，请检查当前密码是否正确',
      color: 'danger',
    })
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  console.log('组件挂载开始')
  console.log('当前用户store状态:', userStore.user)
  console.log('localStorage中的用户信息:', localStorage.getItem('user'))

  // 确保用户store已初始化
  if (!userStore.user) {
    console.log('用户store为空，初始化用户信息')
    userStore.initUser()
  }

  // 初始化表单
  initProfileForm()

  // 延迟一点再次检查，确保响应式更新
  setTimeout(() => {
    console.log('延迟检查表单状态:', profileForm.value)
    if (!profileForm.value.username && !profileForm.value.email) {
      console.log('表单仍为空，再次尝试初始化')
      initProfileForm()
    }
  }, 100)
})

// 监听用户store变化
watch(
  () => userStore.user,
  (newUser) => {
    console.log('用户store发生变化:', newUser)
    if (newUser) {
      initProfileForm()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.profile-view {
  max-width: 800px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 2rem 0;
  color: var(--va-text-primary);
}

.form-section {
  margin-top: 1.5rem;
}

.form-section:not(:last-child) {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 2rem 0;
  color: var(--va-text-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.full-width {
  grid-column: 1 / -1;
}

.avatar-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--va-background-secondary);
  border-radius: var(--va-border-radius);
}

.preview-label {
  font-weight: 600;
  color: var(--va-text-primary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.6rem;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
