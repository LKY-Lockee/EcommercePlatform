<template>
  <div class="profile-view">
    <h2 class="page-title">个人信息</h2>

    <va-form @submit.prevent="handleSave">
      <div class="form-row">
        <div class="form-group">
          <va-input v-model="profileForm.username" label="用户名" :rules="[required]" outline />
        </div>

        <div class="form-group">
          <va-input
            v-model="profileForm.email"
            label="邮箱"
            type="email"
            :rules="[required, emailRule]"
            outline
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <va-input v-model="profileForm.phone" label="手机号" outline />
        </div>

        <div class="form-group">
          <va-input
            v-model="profileForm.avatar"
            label="头像URL"
            outline
            placeholder="请输入头像图片链接"
          />
        </div>
      </div>

      <div class="avatar-preview" v-if="profileForm.avatar">
        <span class="preview-label">头像预览：</span>
        <va-avatar
          :src="profileForm.avatar"
          :fallback-text="profileForm.username?.[0]"
          size="large"
        />
      </div>

      <div class="form-actions">
        <va-button type="submit" :loading="saving"> 保存修改 </va-button>

        <va-button flat @click="resetForm"> 重置 </va-button>
      </div>
    </va-form>

    <va-divider style="margin: 2rem 0" />

    <div class="password-section">
      <h3>修改密码</h3>

      <va-form @submit.prevent="handleChangePassword">
        <div class="form-group">
          <va-input
            v-model="passwordForm.currentPassword"
            label="当前密码"
            type="password"
            :rules="[required]"
            outline
          />
        </div>

        <div class="form-group">
          <va-input
            v-model="passwordForm.newPassword"
            label="新密码"
            type="password"
            :rules="[required, passwordRule]"
            outline
          />
        </div>

        <div class="form-group">
          <va-input
            v-model="passwordForm.confirmPassword"
            label="确认新密码"
            type="password"
            :rules="[required, confirmPasswordRule]"
            outline
          />
        </div>

        <div class="form-actions">
          <va-button type="submit" :loading="changingPassword"> 修改密码 </va-button>
        </div>
      </va-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

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
const required = (value: string) => !!value || '此字段是必填的'

const emailRule = (value: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value) || '请输入有效的邮箱地址'
}

const passwordRule = (value: string) => {
  if (value.length < 6) return '密码至少需要6个字符'
  return true
}

const confirmPasswordRule = (value: string) => {
  return value === passwordForm.value.newPassword || '两次密码输入不一致'
}

const initForm = () => {
  if (userStore.user) {
    profileForm.value = {
      username: userStore.user.username,
      email: userStore.user.email,
      phone: userStore.user.phone || '',
      avatar: userStore.user.avatar || '',
    }
  }
}

const resetForm = () => {
  initForm()
}

const handleSave = async () => {
  saving.value = true

  try {
    const result = await userStore.updateProfile(profileForm.value)

    if (result.success) {
      // 显示成功提示
      console.log('个人信息更新成功')
    } else {
      console.error('更新失败:', result.message)
    }
  } catch (error) {
    console.error('更新个人信息失败:', error)
  } finally {
    saving.value = false
  }
}

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    return
  }

  changingPassword.value = true

  try {
    // 这里需要调用修改密码的API
    console.log('修改密码:', passwordForm.value)

    // 清空密码表单
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  initForm()
})
</script>

<style scoped>
.profile-view {
  max-width: 800px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 2rem 0;
  color: var(--va-text-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.avatar-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--va-background-secondary);
  border-radius: 8px;
}

.preview-label {
  font-weight: 600;
  color: var(--va-text-primary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.password-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: var(--va-text-primary);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
