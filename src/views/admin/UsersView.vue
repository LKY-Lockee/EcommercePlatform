<template>
  <div class="admin-users">
    <!-- 搜索和筛选 -->
    <div class="header-section">
      <div class="filter-section">
        <div class="filter-item">
          <va-input
            v-model="searchQuery"
            placeholder="搜索用户名或邮箱"
            clearable
            @input="handleSearch"
            class="search-input"
          >
            <template #appendInner>
              <va-button
                preset="plain"
                @click="handleSearch"
                icon="search"
                size="small"
                color="primary"
              />
            </template>
          </va-input>
        </div>
        <div class="filter-item">
          <va-select
            v-model="roleFilter"
            placeholder="选择角色"
            :options="roleOptions"
            text-by="text"
            value-by="value"
            clearable
            @update:modelValue="loadUsers"
          />
        </div>
      </div>
    </div>

    <!-- 用户统计 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <va-icon name="people" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon admin">
            <va-icon name="admin_panel_settings" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ stats.admin }}</div>
            <div class="stat-label">管理员</div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon users">
            <va-icon name="person" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ stats.users }}</div>
            <div class="stat-label">普通用户</div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon recent">
            <va-icon name="schedule" />
          </div>
          <div class="stat-details">
            <div class="stat-number">{{ stats.recent }}</div>
            <div class="stat-label">本月新增</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="users-table">
      <va-data-table
        :items="users"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @update:pagination="updatePagination"
        no-data-html="暂无用户"
        class="data-table"
      >
        <template #cell(avatar)="{ rowData }">
          <va-avatar :src="rowData.avatar || '/default-avatar.png'" size="small" />
        </template>

        <template #cell(role)="{ rowData }">
          <va-chip :color="getRoleColor(rowData.role)" size="small" square>
            {{ getRoleText(rowData.role) }}
          </va-chip>
        </template>

        <template #cell(created_at)="{ rowData }">
          <span class="user-date">{{ formatDate(rowData.created_at) }}</span>
        </template>

        <template #cell(actions)="{ rowData }">
          <div class="action-buttons">
            <va-button
              preset="plain"
              size="small"
              icon="edit"
              @click="editUser(rowData)"
              color="warning"
            />
            <va-button
              v-if="rowData.role !== 'admin'"
              preset="plain"
              size="small"
              icon="delete"
              @click="deleteUser(rowData)"
              color="danger"
            />
          </div>
        </template>
      </va-data-table>
    </div>

    <!-- 编辑用户弹窗 -->
    <va-modal
      v-model="showEditDialog"
      :title="'编辑用户'"
      size="large"
      max-width="900px"
      hide-default-actions
      class="user-modal"
    >
      <div class="user-form">
        <va-form ref="userFormRef" @submit.prevent="handleFormSubmit">
          <!-- 用户信息卡片 -->
          <va-card class="form-card">
            <va-card-title class="form-section-title">用户信息</va-card-title>
            <va-card-content>
              <div class="form-grid">
                <div class="form-field-full">
                  <va-input
                    v-model="userForm.username"
                    label="用户名"
                    placeholder="请输入用户名"
                    :rules="[required]"
                    required
                    clearable
                    readonly
                  />
                </div>
                <div class="form-field-full">
                  <va-input
                    v-model="userForm.email"
                    label="邮箱"
                    placeholder="请输入邮箱"
                    :rules="[required, emailRule]"
                    required
                    clearable
                    readonly
                  />
                </div>
              </div>

              <div class="form-grid">
                <div class="form-field-full">
                  <va-input
                    v-model="userForm.phone"
                    label="手机号"
                    placeholder="请输入手机号"
                    clearable
                  />
                </div>
                <div class="form-field-full">
                  <va-select
                    v-model="userForm.role"
                    label="用户角色"
                    placeholder="请选择用户角色"
                    :options="roleOptions"
                    text-by="text"
                    value-by="value"
                    :rules="[required]"
                    required
                  />
                </div>
              </div>
            </va-card-content>
          </va-card>
        </va-form>
      </div>

      <div class="form-actions">
        <va-button @click="closeEditDialog" preset="secondary" size="large"> 取消 </va-button>
        <va-button @click="handleFormSubmit" color="primary" size="large"> 保存 </va-button>
      </div>
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminUsers, deleteUser as deleteUserApi, updateAdminUser } from '@/api/admin'
import type { AdminUser } from '@/types'

const searchQuery = ref('')
const roleFilter = ref<string>('')
const loading = ref(false)
const submitting = ref(false)
const showEditDialog = ref(false)
const selectedUser = ref<AdminUser | null>(null)

// 分页
const pagination = ref({
  page: 1,
  perPage: 20,
  total: 0,
})

// 表单
const userFormRef = ref()
const userForm = ref({
  username: '',
  email: '',
  phone: '',
  role: '' as 'admin' | 'user' | '',
})

// 统计数据
const stats = ref({
  total: 0,
  admin: 0,
  users: 0,
  recent: 0,
})

const users = ref<AdminUser[]>([])

const roleOptions = [
  { text: '管理员', value: 'admin' },
  { text: '普通用户', value: 'user' },
]

const columns = [
  { key: 'avatar', label: '头像', width: 80 },
  { key: 'username', label: '用户名', sortable: true },
  { key: 'email', label: '邮箱', sortable: true },
  { key: 'phone', label: '手机号' },
  { key: 'role', label: '角色' },
  { key: 'created_at', label: '注册时间', sortable: true },
  { key: 'actions', label: '操作', width: 100 },
]

// 表单验证规则
const required = (value: unknown) => !!value || '此字段为必填项'
const emailRule = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value) || '请输入有效的邮箱地址'
}

// 更新分页
const updatePagination = (newPagination: typeof pagination.value) => {
  pagination.value = { ...newPagination }
  loadUsers()
}

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await getAdminUsers({
      page: pagination.value.page,
      limit: pagination.value.perPage,
      search: searchQuery.value,
      role: roleFilter.value || undefined,
    })
    const responseData = response.data
    if (responseData && responseData.items) {
      users.value = responseData.items

      // 更新分页信息
      if (responseData.pagination) {
        pagination.value.total = responseData.pagination.total_pages
      }

      // 计算统计信息
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      stats.value = {
        total: responseData.pagination?.total || 0,
        admin: users.value.filter((u) => u.role === 'admin').length,
        users: users.value.filter((u) => u.role === 'user').length,
        recent: users.value.filter((u) => {
          const userDate = new Date(u.created_at)
          return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear
        }).length,
      }
    } else {
      users.value = []
      stats.value = {
        total: 0,
        admin: 0,
        users: 0,
        recent: 0,
      }
    }
  } catch (error) {
    console.error('加载用户失败:', error)
    users.value = []
    stats.value = {
      total: 0,
      admin: 0,
      users: 0,
      recent: 0,
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadUsers()
}

const editUser = (user: AdminUser) => {
  selectedUser.value = user
  userForm.value = {
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
  }
  showEditDialog.value = true
}

const deleteUser = async (user: AdminUser) => {
  try {
    if (confirm(`确定要删除用户 "${user.username}" 吗？此操作不可撤销。`)) {
      await deleteUserApi(user.id)
      console.log('用户删除成功')
      loadUsers()
    }
  } catch (error) {
    console.error('删除用户失败:', error)
    console.log('删除用户失败')
  }
}

const closeEditDialog = () => {
  showEditDialog.value = false
  selectedUser.value = null
  userForm.value = {
    username: '',
    email: '',
    phone: '',
    role: '',
  }
}

const handleFormSubmit = async () => {
  if (!selectedUser.value) return

  try {
    submitting.value = true
    await updateAdminUser(selectedUser.value.id, {
      phone: userForm.value.phone,
      role: userForm.value.role as 'admin' | 'user',
    })

    console.log('用户更新成功')

    closeEditDialog()
    loadUsers()
  } catch (error) {
    console.error('更新用户失败:', error)
    console.log('更新用户失败')
  } finally {
    submitting.value = false
  }
}

const getRoleText = (role: string) => {
  const texts: Record<string, string> = {
    admin: '管理员',
    user: '普通用户',
  }
  return texts[role] || role
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'warning',
    user: 'info',
  }
  return colors[role] || 'secondary'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.filter-section {
  display: flex;
  gap: 1rem;
}

.filter-item {
  min-width: 0;
}

.search-input {
  width: 100%;
  border-radius: 25px;
}

.search-input :deep(.va-input__container) {
  border-radius: 25px;
  background: rgba(var(--va-background-secondary-rgb), 0.5);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  padding-right: 40px;
}

.search-input :deep(.va-input__container):hover {
  border-color: var(--va-primary);
  box-shadow: 0 0 0 3px rgba(var(--va-primary-rgb), 0.1);
}

.search-input :deep(.va-input__container--focused) {
  border-color: var(--va-primary);
  box-shadow: 0 0 0 3px rgba(var(--va-primary-rgb), 0.15);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.stat-icon.total {
  background: var(--va-primary);
}

.stat-icon.admin {
  background: #f59e0b;
}

.stat-icon.users {
  background: #10b981;
}

.stat-icon.recent {
  background: #8b5cf6;
}

.stat-details {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.25rem;
  color: var(--va-text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  font-weight: 500;
}

.users-table {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow-x: auto;
}

.data-table {
  min-width: 800px;
}

.user-date {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* 弹窗样式 */
.user-modal :deep(.va-modal__container) {
  border-radius: 12px;
  overflow: hidden;
}

.user-modal :deep(.va-modal__title) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.user-form {
  padding: 0;
}

.form-card {
  margin-bottom: 1.25rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-section-title {
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  color: #374151 !important;
}

.form-card :deep(.va-card__title) {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.25rem 1.5rem;
  margin: 0;
}

.form-card :deep(.va-card__content) {
  padding: 1.75rem 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-field-full {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.form-field-full:not(:last-child) {
  margin-bottom: 1rem;
}

.form-field-full :deep(.va-input),
.form-field-full :deep(.va-textarea) {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 0 0.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
}

.form-actions .va-button {
  min-width: 120px;
  height: 44px;
  font-size: 0.95rem;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  margin: 0;
}

@media (max-width: 1024px) {
  .header-section {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-section {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .users-table {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-content {
    gap: 0.75rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }
}
</style>
