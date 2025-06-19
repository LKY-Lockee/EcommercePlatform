好的。接下来对注册和登录界面重新设计，并且移除登陆界面的第三方登录
<template>
  <div class="admin-users">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
    </div>

    <!-- 搜索筛选区 -->
    <div class="search-section">
      <div class="search-content">
        <div class="search-input">
          <va-input
            v-model="searchQuery"
            placeholder="搜索用户名或邮箱"
            clearable
            @input="handleSearch"
          >
            <template #prepend>
              <va-icon name="search" />
            </template>
          </va-input>
        </div>
      </div>
    </div>

    <!-- 用户表格 -->
    <div class="users-table">
      <va-data-table
        :items="users"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @update:pagination="updatePagination"
        class="data-table"
        no-data-html="暂无用户"
      >
        <template #cell(avatar)="{ rowData }">
          <va-avatar :src="rowData.avatar || '/default-avatar.png'" size="small" />
        </template>

        <template #cell(role)="{ rowData }">
          <span :class="`role-badge ${rowData.role}`">
            {{ rowData.role === 'admin' ? '管理员' : '用户' }}
          </span>
        </template>

        <template #cell(created_at)="{ rowData }">
          <span class="date-text">{{ formatDate(rowData.created_at) }}</span>
        </template>

        <template #cell(actions)="{ rowData }">
          <div class="action-buttons">
            <va-button
              v-if="rowData.role !== 'admin'"
              preset="plain"
              size="small"
              icon="delete"
              color="danger"
              @click="deleteUserConfirm(rowData)"
            />
          </div>
        </template>
      </va-data-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminUsers, deleteUser } from '@/api/admin'
import type { AdminUser } from '@/types'

const loading = ref(false)
const users = ref<AdminUser[]>([])
const searchQuery = ref('')

const pagination = ref({
  page: 1,
  perPage: 20,
  total: 0,
})

const columns = [
  { key: 'avatar', label: '头像', width: '80px' },
  { key: 'username', label: '用户名', sortable: true },
  { key: 'email', label: '邮箱', sortable: true },
  { key: 'phone', label: '手机号' },
  { key: 'role', label: '角色' },
  { key: 'created_at', label: '注册时间', sortable: true },
  { key: 'actions', label: '操作', width: '120px' },
]

const loadUsers = async () => {
  try {
    loading.value = true
    const response = await getAdminUsers({
      page: pagination.value.page,
      limit: pagination.value.perPage,
      search: searchQuery.value,
    })
    const responseData = response.data
    if (responseData) {
      users.value = responseData.items || []
      pagination.value.total = responseData.pagination.total || 0
    } else {
      users.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    console.error('加载用户失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadUsers()
}

const updatePagination = (newPagination: typeof pagination.value) => {
  pagination.value = { ...pagination.value, ...newPagination }
  loadUsers()
}

const deleteUserConfirm = (user: AdminUser) => {
  if (confirm(`确定要删除用户 "${user.username}" 吗？此操作不可撤销。`)) {
    handleDeleteUser(user.id)
  }
}

const handleDeleteUser = async (id: number) => {
  try {
    await deleteUser(id)
    loadUsers()
  } catch (error) {
    console.error('删除用户失败:', error)
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 搜索筛选区 */
.search-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  padding: 20px;
}

.search-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.search-input {
  max-width: 400px;
}

@media (min-width: 768px) {
  .search-content {
    grid-template-columns: 1fr auto;
    align-items: center;
  }
}

/* 用户表格 */
.users-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.data-table {
  --va-data-table-thead-background: #f8fafc;
  --va-data-table-thead-color: #475569;
  --va-data-table-border-color: #e2e8f0;
}

/* 角色标签 */
.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.admin {
  background-color: #fef3c7;
  color: #92400e;
}

.role-badge.user {
  background-color: #e0f2fe;
  color: #0277bd;
}

/* 日期文本 */
.date-text {
  color: #64748b;
  font-size: 14px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
