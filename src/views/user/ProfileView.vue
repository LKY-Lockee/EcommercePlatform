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
  if (!value || String(value).trim() === '') {
    return '此字段是必填的'
  }
  return true
}

const emailRule = (value: unknown) => {
  if (!value || String(value).trim() === '') {
    return '邮箱是必填的'
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(String(value)) || '请输入有效的邮箱地址'
}

const passwordRule = (value: unknown) => {
  if (!value || String(value).trim() === '') {
    return '密码是必填的'
  }
  return String(value).length >= 6 || '密码至少需要6个字符'
}

const confirmPasswordRule = (value: unknown) => {
  if (!value || String(value).trim() === '') {
    return '请确认密码'
  }
  return String(value) === passwordForm.value.newPassword || '两次密码输入不一致'
}

const initProfileForm = () => {
  if (userStore.user) {
    profileForm.value = {
      username: userStore.user.username || '',
      email: userStore.user.email || '',
      phone: userStore.user.phone || '',
      avatar: userStore.user.avatar || '',
    }
  }
}

const resetProfileForm = () => {
  initProfileForm()
  profileFormRef.value?.resetValidation?.()
}

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  passwordFormRef.value?.resetValidation?.()
}

const handleSave = async () => {
  const isValid = await profileFormRef.value?.validate()
  if (!isValid) return

  saving.value = true
  try {
    const result = await userStore.updateProfile(profileForm.value)
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
  } catch {
    notify({
      message: '更新个人信息失败，请检查网络连接',
      color: 'danger',
    })
  } finally {
    saving.value = false
  }
}

const handleChangePassword = async () => {
  const isValid = await passwordFormRef.value?.validate()
  if (!isValid) return

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    notify({
      message: '两次密码输入不一致',
      color: 'warning',
    })
    return
  }

  changingPassword.value = true
  try {
    await userAPI.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })

    notify({
      message: '密码修改成功',
      color: 'success',
    })
    resetPasswordForm()
  } catch {
    notify({
      message: '修改密码失败，请检查当前密码是否正确',
      color: 'danger',
    })
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  if (!userStore.user) {
    userStore.initUser()
  }
  initProfileForm()
})

watch(
  () => userStore.user,
  (newUser) => {
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
